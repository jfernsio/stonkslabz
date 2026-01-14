package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"jfernsio/stonksbackend/config"
	"jfernsio/stonksbackend/database"
	"jfernsio/stonksbackend/models"
	"log"
	"strings"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v3/client"
)

type FinhubResp struct {
	CurrentPrice float64 `json:"c"`
}

var fihubApi string

func StockMarketPrice(symbol string, fihubApi string) (decimal.Decimal, error) {
	log.Println(symbol)
	url := fmt.Sprintf("https://finnhub.io/api/v1/quote?symbol=%s&token=%s", symbol, fihubApi)
	fmt.Println("apikey", fihubApi)
	cc := client.New()
	cc.SetTimeout(5 * time.Second)
	resp, err := cc.Get(url)
	if err != nil {
		log.Println("error", err)
		return decimal.Zero, err
	}
	var f FinhubResp
	if err := json.Unmarshal(resp.Body(), &f); err != nil {
		log.Println("json decodeerro", err)
		return decimal.Zero, nil
	}
	log.Println("f", f.CurrentPrice)
	if f.CurrentPrice <= 0 {
		return decimal.Zero, errors.New("invalid market price")
	}
	//convert flost to decimal
	price := decimal.NewFromFloat(f.CurrentPrice)

	log.Println("convprice", price)
	return price, nil
}

func BuyStockHandler(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	fihubApi = cfg.FinHub

	symbol := strings.ToUpper(c.Params("symbol"))

	quantityStr := c.Params("quantity")
	qty, err := decimal.NewFromString(quantityStr)
	if err != nil || qty.Sign() <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid quantity"})
	}

	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	marketPrice, err := StockMarketPrice(symbol, fihubApi)
	if err != nil {
		return c.Status(503).JSON(fiber.Map{"error": "Market unavailable"})
	}

	// totalCost = qty * price
	totalCost := qty.Mul(marketPrice)
	fmt.Println("totdalCosts", totalCost)

	tx := database.Database.Db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var wallet models.Wallet
	//locak row to prevent double spendin
	if err := tx.
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("user_id = ?", userID).
		First(&wallet).Error; err != nil {

		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"error": "Wallet not found"})
	}

	// var Balance decimal.Decimal = decimal.NewFromUint64(wallet.Balance).Mul(decimal.NewFromInt(1e8))
	// log.Println("balance",Balance)
	// log.Println("uint64totdalcost",uint64(totalCostSats))
	// log.Println("normal balcne",wallet.Balance)
	//  satbal := (wallet.Balance * 1e8)
	// log.Println("satoshibal",satbal)
	balance := wallet.Balance
	log.Println("balance", balance)
	if balance.Cmp(totalCost) < 0 {
		tx.Rollback()
		return c.Status(422).JSON(fiber.Map{"error": "Insufficient balance"})
	}

	wallet.Balance = balance.Sub(totalCost)
	if err := tx.Save(&wallet).Error; err != nil {
		tx.Rollback()
		return c.SendStatus(500)
	}

	var holding models.Holding
	//check if existing symbol exist
	err = tx.Where("wallet_id = ? AND symbol = ?", wallet.ID, symbol).
		First(&holding).Error
	//if not add first
	if errors.Is(err, gorm.ErrRecordNotFound) {
		holding = models.Holding{
			WalletID:    wallet.ID,
			Symbol:      symbol,
			Type:        models.STOCK,
			Quantity:    qty,
			AvgBuyPrice: marketPrice,
		}
		if err := tx.Create(&holding).Error; err != nil {
			tx.Rollback()
			return c.SendStatus(500)
		}
	} else if err == nil {
		//update existing holdings
		currentValue := holding.Quantity.Mul(holding.AvgBuyPrice)
		addedValue := qty.Mul(marketPrice)

		newQty := holding.Quantity.Add(qty)
		newAvg := currentValue.Add(addedValue).Div(newQty)

		holding.Quantity = newQty
		holding.AvgBuyPrice = newAvg

		if err := tx.Save(&holding).Error; err != nil {
			tx.Rollback()
			return c.SendStatus(500)
		}
	} else {
		tx.Rollback()
		return c.SendStatus(500)
	}

	trade := models.Transaction{
		WalletID:     wallet.ID,
		Symbol:       symbol,
		Type:         "BUY",
		Quantity:     qty,
		PricePerUnit: marketPrice,
		TotalAmount:  totalCost,
	}

	if err := tx.Create(&trade).Error; err != nil {
		tx.Rollback()
		return c.SendStatus(500)
	}

	if err := tx.Commit().Error; err != nil {
		return c.SendStatus(500)
	}

	return c.JSON(fiber.Map{
		"status":    "success",
		"balance":   wallet.Balance.StringFixed(8), // Convert back for display
		"avg_price": holding.AvgBuyPrice.StringFixed(8),
		"quantity":  holding.Quantity.StringFixed(8),
	})
}

func SellStocksHandler(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	fihubApi = cfg.FinHub
	symbol := strings.ToUpper(c.Params("symbol"))
	log.Println("symbol", symbol)

	quantityStr := c.Params("quantity")
	qty, err := decimal.NewFromString(quantityStr)

	if err != nil || qty.Sign() <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid quantity"})
	}

	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	price, err := StockMarketPrice(symbol, fihubApi)
	if err != nil {
		return c.Status(503).JSON(fiber.Map{"error": "Market unavailable"})
	}

	// Calculate total sale
	totalSale := qty.Mul(price)

	tx := database.Database.Db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	//verify wallet exists
	var wallet models.Wallet
	log.Println("userid", userID)
	if err := tx.
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("user_id = ?", userID).
		First(&wallet).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"error": "Wallet not found"})
	}

	//verify holding exists
	var holding models.Holding
	//lock the row to prevent double spending

	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("wallet_id = ? AND symbol = ?", wallet.ID, symbol).First(&holding).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(400).JSON(fiber.Map{"error": "You do not own this asset"})
		}
		return c.Status(404).JSON(fiber.Map{"error": "Database error"})
	}

	//check if user has enuf quantity to sell
	if holding.Quantity.Cmp(qty) < 0 {
		tx.Rollback()
		return c.Status(422).JSON(fiber.Map{"error": "Insufficient asset quantity"})
	}

	//calculate pnl
	pnl := qty.Mul(price.Sub(holding.AvgBuyPrice))

	//update holding quantity
	holding.Quantity = holding.Quantity.Sub(qty)
	//if quantity is zeeo delete holding
	if holding.Quantity.IsZero() {
		if err := tx.Delete(&holding).Error; err != nil {
			tx.Rollback()
			return c.SendStatus(500)
		}
	} else {
		if err := tx.Save(&holding).Error; err != nil {
			tx.Rollback()
			return c.SendStatus(500)
		}
	}

	//update wallet balance
	wallet.Balance = wallet.Balance.Add(totalSale)
	if err := tx.Save(&wallet).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Couldnt update wallet balance"})
	}

	//create transaction record w pnl
	trade := models.Transaction{
		WalletID:     wallet.ID,
		Symbol:       symbol,
		Type:         models.Sell,
		Quantity:     qty,
		PricePerUnit: price,
		TotalAmount:  totalSale,
		RealizedPnL:  pnl,
	}
	if err := tx.Create(&trade).Error; err != nil {
		tx.Rollback()
		return c.SendStatus(500)
	}
	if err := tx.Commit().Error; err != nil {
		return c.SendStatus(500)
	}

	return c.JSON(fiber.Map{
		"status":             "success",
		"new_balance":        wallet.Balance.StringFixed(8), // Convert back for display
		"pnl":                pnl.StringFixed(2),
		"sold_at":            price.StringFixed(8),
		"remaining_quantity": holding.Quantity.StringFixed(8),
	})
}
