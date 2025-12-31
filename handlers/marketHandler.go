package handlers

import (
	"fmt"
	"jfernsio/stonksbackend/config"

	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v3/client"
)


func GetMarketData(c *fiber.Ctx) error {
	//retrice config from context
	cfg := c.Locals("config").(*config.Config)

	//get apikey 
	coinApi := cfg.CoinGecko
	url := "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=bitcoin,solana&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"
	fmt.Println("running")
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url, client.Config{
		Header: map[string]string{
			"x-cg-demo-api-key": coinApi,
		},
	})

	fmt.Println("stopped")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"data": string(resp.Body())})
}

func GetTopGainers(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	fmt.Println("cnfh",cfg)
	fmpApi := cfg.FMP
	url := fmt.Sprintf("https://financialmodelingprep.com/stable/biggest-gainers?apikey=%s",fmpApi)
	fmt.Println("url",fmpApi)
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url)

	fmt.Println("stopped")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"data": string(resp.Body())})
}

func GetTopLosers(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	fmpApi := cfg.FMP
	url := fmt.Sprintf("https://financialmodelingprep.com/stable/biggest-losers?apikey=%s", fmpApi)
	fmt.Println("url",fmpApi)
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url)

	fmt.Println("stopped")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"data": string(resp.Body())})
}

func GetStockData(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	fmpApi := cfg.FMP
	url := fmt.Sprintf("https://financialmodelingprep.com/api/stable/quote/AAPL,MSFT,GOOGL,NVDA,TSLA?apikey=%s", fmpApi)
	fmt.Println("url",fmpApi)
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url)

	fmt.Println("stopped")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"data": string(resp.Body())})
}

func GetIpoData(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	fmpApi := cfg.FMP
	url := fmt.Sprintf("https://financialmodelingprep.com/api/v3/ipo-calendar?apikey=%s", fmpApi)
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	resp, err := cc.Get(url)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"data": string(resp.Body())})
}

func GetInsiderData(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	finhubApi := cfg.FinHub
	url := "https://finnhub.io/api/v1/stock/insider-transactions?symbol=TSLA"
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	resp, err := cc.Get(url, client.Config{
		Header: map[string]string{
			"X-Finnhub-Token": finhubApi,
		},
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"data": string(resp.Body())})
}

func GetInsiderSentiment(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	finhubApi := cfg.FinHub
	url := "https://finnhub.io/api/v1/stock/insider-sentiment?symbol=TSLA"
	fmt.Println("running")
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url, client.Config{
		Header: map[string]string{
			"X-Finnhub-Token": finhubApi,
		},
	})

	fmt.Println("stopped")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"data": string(resp.Body())})
}