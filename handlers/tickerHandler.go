package handlers

import (
	"bytes"
	"encoding/json"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v3/client"
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

func MarketPrice(symbol string) (error, float64) {

	url := "https://api.binance.com/api/v3/ticker/price?symbol=" + symbol + "USDT"
	cc := client.New()
	cc.SetTimeout(5 * time.Second)

	//send request
	resp, err := cc.Get(url)
	if err != nil {
		return err, 0
	}

	var priceData BinancePriceResp
	if err := json.NewDecoder(bytes.NewReader(resp.Body())).Decode(&priceData); err != nil {
		return err, 0
	}

	//convert string price to float
	price, err := strconv.ParseFloat(priceData.Price, 64)
	if err != nil {
		return err, 0
	}
	return nil, price

}

func GetTickerData(c *fiber.Ctx) error {
	symbol := c.Params("symbol")
	err, price := MarketPrice(symbol)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"price": price})
}
