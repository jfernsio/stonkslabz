package handlers

import (
	"bytes"
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
	CurrentPrice  float64 `json:"c"`
	Change        float64 `json:"d"`
	PercentChange float64 `json:"dp"`
	HighofDay     float64 `json:"h"`
	LowofDay      float64 `json:"l"`
	Open          float64 `json:"o"`
	PreviousClose float64 `json:"pc"`
	Timestamp     int     `json:"t"`
}
type Pr struct {
	Price float64 `json:"c"`
}

func StockMarketPrice(symbol string, fihubApi string) (uint64, error) {

	url := fmt.Sprintf("https://finnhub.io/api/v1/quote?symbol=%s&token=%s", symbol, fihubApi)
	fmt.Println("apikey",fihubApi)
	cc := client.New()
	cc.SetTimeout(5 * time.Second)
	resp, err := cc.Get(url)
	if err != nil {
		return 0, err
	}
	var f FinhubResp
	fmt.Println(json.NewDecoder(bytes.NewReader(resp.Body())).Decode(&f))
	var priceData Pr
	if err := json.NewDecoder(bytes.NewReader(resp.Body())).Decode(&priceData);err != nil {
		return 0, err
	}
	fmt.Println(priceData)
	// Convert to satoshis (1e8 = 100000000)
	price := uint64(priceData.Price * 1e8)

	log.Println("convprice", price)
	return price, nil
}

func BuyStockHandler(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	fihubApi := cfg.FinHub
	
    symbol := strings.ToUpper(c.Params("symbol"))

    // Parse quantity EXACTLY
    qtyDec, err := decimal.NewFromString(c.Params("quantity"))
    if err != nil || qtyDec.LessThanOrEqual(decimal.Zero) {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid quantity"})
    }

    // Convert quantity to satoshis (int)
    qtySats := qtyDec.Mul(decimal.NewFromInt(1e8)).IntPart()

    userID, ok := c.Locals("user_id").(uint)
    if !ok {
        return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
    }

    // priceSats = price per unit in satoshis
    priceSats, err := StockMarketPrice(symbol,fihubApi)
    if err != nil {
        return c.Status(503).JSON(fiber.Map{"error": "Market unavailable"})
    }

    priceDec := decimal.NewFromInt(int64(priceSats)).Div(decimal.NewFromInt(1e8))

    // totalCost = qty * price
    totalCostDec := qtyDec.Mul(priceDec)
    totalCostSats := totalCostDec.Mul(decimal.NewFromInt(1e8)).IntPart()
	fmt.Println("totdalCosts",totalCostSats)
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

    if wallet.Balance < uint64(totalCostSats) {
        tx.Rollback()
        return c.Status(422).JSON(fiber.Map{"error": "Insufficient balance"})
    }

    wallet.Balance -= uint64(totalCostSats)
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
			Type: models.STOCK,
            Quantity:    uint64(qtySats),
            AvgBuyPrice: uint64(priceSats),
        }
        if err := tx.Create(&holding).Error; err != nil {
            tx.Rollback()
            return c.SendStatus(500)
        }
    } else if err == nil {
        // else convert existing holding to decimal
        existingQty := decimal.NewFromInt(int64(holding.Quantity)).Div(decimal.NewFromInt(1e8))
        existingPrice := decimal.NewFromInt(int64(holding.AvgBuyPrice)).Div(decimal.NewFromInt(1e8))

        currentValue := existingQty.Mul(existingPrice)
        addedValue := qtyDec.Mul(priceDec)

        newQty := existingQty.Add(qtyDec)
        newAvg := currentValue.Add(addedValue).Div(newQty)

        holding.Quantity = uint64(newQty.Mul(decimal.NewFromInt(1e8)).IntPart())
        holding.AvgBuyPrice = uint64(newAvg.Mul(decimal.NewFromInt(1e8)).IntPart())

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
        Quantity:     uint64(qtySats),
        PricePerUnit: uint64(priceSats),
        TotalAmount:  uint64(totalCostSats),
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
        "balance":   decimal.NewFromInt(int64(wallet.Balance)).Div(decimal.NewFromInt(1e8)),
        "avg_price": decimal.NewFromInt(int64(holding.AvgBuyPrice)).Div(decimal.NewFromInt(1e8)),
        "quantity":  decimal.NewFromInt(int64(holding.Quantity)).Div(decimal.NewFromInt(1e8)),
    })
}

	

