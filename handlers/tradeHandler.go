package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"jfernsio/stonksbackend/database"
	"jfernsio/stonksbackend/models"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v3/client"
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

func MarketPrice(symbol string) (uint64, error) {

	url := "https://api.binance.com/api/v3/ticker/price?symbol=" + symbol + "USDT"
	cc := client.New()
	cc.SetTimeout(5 * time.Second)

	//send request
	resp, err := cc.Get(url)
	if err != nil {
		return 0, err
	}

	var priceData BinancePriceResp
	if err := json.NewDecoder(bytes.NewReader(resp.Body())).Decode(&priceData); err != nil {
		return 0, err
	}
	log.Println(priceData)
	// Parse as float first
	priceFloat, err := strconv.ParseFloat(priceData.Price, 64)
	if err != nil {
		return 0, err
	}
	// Convert to satoshis per satoshi (price in USDT per BTC, since 1 satoshi_USDT = 1e-8 USDT, 1 satoshi_BTC = 1e-8 BTC)
	price := uint64(priceFloat)

	log.Println("convprice", price)
	return price, nil

}

func BuyHandler(c *fiber.Ctx) error {
	symbol := strings.ToUpper(c.Params("symbol"))
	log.Println("symbol", symbol)

	// Parse quantity as float first, then convert to satoshis
	qtyFloat, err := strconv.ParseFloat(c.Params("quantity"), 64)
	if err != nil || qtyFloat <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid quantity"})
	}

	// Convert quantity to satoshis (e.g., 0.5 BTC = 50000000 satoshis) i.e 1^8
	qty := uint64(qtyFloat * 1e8)

	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	price, err := MarketPrice(symbol)
	if err != nil {
		return c.Status(503).JSON(fiber.Map{"error": "Market unavailable"})
	}

	// Calculate total cost
	// qty in satoshi_BTC, price in satoshi_USDT per satoshi_BTC
	totalCost := qty * price

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
	// wallet.Balance := wallet.Balance * 1e8
	log.Println("Balamce", wallet.Balance)
	if wallet.Balance < totalCost {
		tx.Rollback()
		return c.Status(422).JSON(fiber.Map{"error": "Insufficient balance"})
	}

	wallet.Balance -= totalCost
	// log.Println("New bal",wallet.Balance)
	// wallet.Balance = uint64(wallet.Balance / 1e8)
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
		current := holding.Quantity * holding.AvgBuyPrice
		added := qty * price
		total_value := current + added
		totalQty := holding.Quantity + qty

		holding.AvgBuyPrice = total_value / totalQty
		holding.Quantity = totalQty

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
		"balance":   float64(wallet.Balance) / 1e8, // Convert back for display
		"avg_price": float64(holding.AvgBuyPrice),
		"quantity":  float64(holding.Quantity) / 1e8,
	})
}
