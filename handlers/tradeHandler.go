package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"jfernsio/stonksbackend/database"
	"jfernsio/stonksbackend/models"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v3/client"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type BinancePriceResp struct {
	Symbol string `json:"symbol"`
	Price  string `json:"price"` // Binance sends price as a string!
}

type UserReq struct {
	Symbol        string `json:"symbol"`
	Quantity      string `json:"quantity"`
	ExpectedPrice string `json:"expectedPrice"`
}

func MarketPrice(symbol string) (decimal.Decimal, error) {

	url := "https://api.binance.com/api/v3/ticker/price?symbol=" + symbol + "USDT"
	cc := client.New()
	cc.SetTimeout(5 * time.Second)

	//send request
	resp, err := cc.Get(url)
	if err != nil {
		return decimal.Zero, err
	}

	var priceData BinancePriceResp
	if err := json.NewDecoder(bytes.NewReader(resp.Body())).Decode(&priceData); err != nil {
		return decimal.Zero, err
	}
	log.Println(priceData)
	// convert price to decimal
	price, err := decimal.NewFromString(priceData.Price)
	if err != nil {
		return decimal.Zero, err
	}

	log.Println("convprice in decimal", symbol, price)
	return price, nil

}

func BuyHandler(c *fiber.Ctx) error {
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

	price, err := MarketPrice(symbol)
	if err != nil {
		return c.Status(503).JSON(fiber.Map{"error": "Market unavailable"})
	}

	// Calculate total cost
	//multiply decimal by decimal for total cost wih proper precsion
	totalCost := qty.Mul(price)
	log.Println("total cost", totalCost)
	tx := database.Database.Db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var wallet models.Wallet
	if err := tx.
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("user_id = ?", userID).
		First(&wallet).Error; err != nil {

		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"error": "Wallet not found"})
	}

	log.Println("Balamce", wallet.Balance)
	balance := wallet.Balance
	if balance.Cmp(totalCost) < 0 {
		tx.Rollback()
		return c.Status(422).JSON(fiber.Map{"error": "Insufficient balance"})
	}

	wallet.Balance = balance.Sub(totalCost)
	log.Println("Saved bal", wallet.Balance)

	if err := tx.Save(&wallet).Error; err != nil {
		tx.Rollback()
		return c.SendStatus(500)
	}

	var holding models.Holding
	err = tx.Where("wallet_id = ? AND symbol = ?", wallet.ID, symbol).
		First(&holding).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		//creates new holding
		holding = models.Holding{
			WalletID:    wallet.ID,
			Symbol:      symbol,
			Quantity:    qty,
			AvgBuyPrice: price,
			Type:        models.CRYPTO,
		}
		if err := tx.Create(&holding).Error; err != nil {
			tx.Rollback()
			return c.SendStatus(500)
		}
	} else if err == nil {
		//adds to existing holding
		current := holding.Quantity.Mul(holding.AvgBuyPrice)
		added := qty.Mul(price)

		newTotalValue := current.Add(added)
		newTotalQty := holding.Quantity.Add(qty)

		holding.AvgBuyPrice = newTotalValue.Div(newTotalQty)
		holding.Quantity = newTotalQty

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
		Type:         models.Buy,
		Quantity:     qty,
		PricePerUnit: price,
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

func SellHandler(c *fiber.Ctx) error {
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

	price, err := MarketPrice(symbol)
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
