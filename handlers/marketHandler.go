package handlers

import (
	"encoding/json"
	"fmt"
	"jfernsio/stonksbackend/config"
	"log"
	"strings"

	"time"

	"jfernsio/stonksbackend/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v3/client"
)

var Stocksymbols = []string{"APPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "JPM", "IBM", "RELIANCE.BSE", "TCS.BSE", "HDFCBANK.BSE", "INFY.BSE", "ICICIBANK.BSE", "BAJFINANCE.BSE", "KOTAKBANK.BSE", "HINDUNILVR.BSE", "SBIN.BSE", "LT.BSE", "AXISBANK.BSE", "NESTLEIND.BSE", "ASIANPAINT.BSE"}

func GetCryptoData(c *fiber.Ctx) error {
	// retrieve config from context
	cfg := c.Locals("config").(*config.Config)
	coinApi := cfg.CoinGecko

	ctx := c.Context()
	cacheKey := "crypto_market_data"

	// 1. Try Redis first
	cached, err := config.Redis.Client.Get(ctx, cacheKey).Bytes()
	if err == nil && len(cached) > 0 {
		// Cache hit
		log.Println("cache hit")
		data, err := utils.GzipDecompress(cached)
		if err != nil {
			log.Println("Decompression error:", err)
			// Continue to fetch fresh data
		} else {
			return c.JSON(fiber.Map{cacheKey: string(data)})
		}
	}

	// 2. Build CoinGecko request
	symbols := []string{
		"bitcoin", "ethereum", "solana", "tether",
		"binancecoin", "ripple", "tron", "dogecoin",
		"cardano", "polkadot", "uniswap", "litecoin",
	}
	ids := strings.Join(symbols, ",")

	url := fmt.Sprintf(
		"https://api.coingecko.com/api/v3/simple/price"+
			"?vs_currencies=usd"+
			"&ids=%s"+
			"&include_market_cap=true"+
			"&include_24hr_vol=true"+
			"&include_24hr_change=true",
		ids,
	)

	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	resp, err := cc.Get(url, client.Config{
		Header: map[string]string{
			"x-cg-demo-api-key": coinApi,
		},
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	body := resp.Body()
	//compress data
	compressed, err := utils.GzipCompress(body)
	if err != nil {
		log.Println("Compression error:", err)
	}

	// 3. Store in Redis (5 minutes)
	if err = config.Redis.Client.Set(ctx, cacheKey, compressed, 4*time.Hour).Err(); err != nil {
		log.Println("Redis set error:", err)
	} else {
		log.Println("Data cached in Redis")
	}

	// 4. Return raw JSON
	return c.JSON(fiber.Map{cacheKey: string(resp.Body())})
}

func GetTopGainers(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	ctx := c.Context()
	cacheKey := "gainers_market_data"

	// 1. Try Redis first
	cached, err := config.Redis.Client.Get(ctx, cacheKey).Bytes()
	if err == nil && len(cached) > 0 {
		// Cache hit
		log.Println("cache hit")
		data, err := utils.GzipDecompress(cached)
		if err != nil {
			log.Println("Decompression error:", err)
			// Continue to fetch fresh data
		} else {
			return c.JSON(fiber.Map{cacheKey: string(data)})
		}
	}
	fmpApi := cfg.FMP
	url := fmt.Sprintf("https://financialmodelingprep.com/stable/biggest-gainers?apikey=%s", fmpApi)
	fmt.Println("url", fmpApi)
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	body := resp.Body()
	//compress data
	compressed, err := utils.GzipCompress(body)
	if err != nil {
		log.Println("Compression error:", err)
	}

	// 3. Store in Redis (5 minutes)
	if err = config.Redis.Client.Set(ctx, cacheKey, compressed, 4*time.Hour).Err(); err != nil {
		log.Println("Redis set error:", err)
	} else {
		log.Println("Data cached in Redis")
	}

	return c.JSON(fiber.Map{"data": string(body)})
}

func GetTopLosers(c *fiber.Ctx) error {
	ctx := c.Context()
	cacheKey := "losers_market_data"

	// 1. Try Redis first
	cached, err := config.Redis.Client.Get(ctx, cacheKey).Bytes()
	if err == nil && len(cached) > 0 {
		// Cache hit
		log.Println("cache hit")
		data, err := utils.GzipDecompress(cached)
		if err != nil {
			log.Println("Decompression error:", err)
			// Continue to fetch fresh data
		} else {
			return c.JSON(fiber.Map{cacheKey: string(data)})
		}
	}
	cfg := c.Locals("config").(*config.Config)
	fmpApi := cfg.FMP
	url := fmt.Sprintf("https://financialmodelingprep.com/stable/biggest-losers?apikey=%s", fmpApi)

	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	body := resp.Body()
	//compress data
	compressed, err := utils.GzipCompress(body)
	if err != nil {
		log.Println("Compression error:", err)
	}

	// 3. Store in Redis (5 minutes)
	if err = config.Redis.Client.Set(ctx, cacheKey, compressed, 4*time.Hour).Err(); err != nil {
		log.Println("Redis set error:", err)
	} else {
		log.Println("Data cached in Redis")
	}

	return c.JSON(fiber.Map{"data": string(body)})
}

func GetStockData(c *fiber.Ctx, symbol string) ([]byte, error) {
	cfg := c.Locals("config").(*config.Config)
	alpha := cfg.Alpha
	url := fmt.Sprintf("https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=%s&apikey=%s", symbol, alpha)
	fmt.Println("url", alpha)
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url)

	fmt.Println("stopped")
	if err != nil {
		return nil, err
	}
	return resp.Body(), err
}

func GetIpoData(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	finhub := cfg.FinHub
	url := fmt.Sprintf("https://finnhub.io/api/v1/calendar/ipo?from=2025-12-31&to=2026-01-07&token=%s", finhub)
	fmt.Println("url ipo", url)
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
	symbol := c.Query("symbol", "TSLA") // Default to TSLA if not provided
	url := fmt.Sprintf("https://finnhub.io/api/v1/stock/insider-transactions?symbol=%s", symbol)
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
	symbol := c.Query("symbol", "TSLA") // Default to TSLA if not provided
	url := fmt.Sprintf("https://finnhub.io/api/v1/stock/insider-sentiment?symbol=%s", symbol)
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

func Market(c *fiber.Ctx) error {
	cacheKey := "stock_market_data"
	ctx := c.Context()

	// 1. Try Redis first
	cached, err := config.Redis.Client.Get(ctx, cacheKey).Bytes()
	if err == nil && len(cached) > 0 {
		// Cache hit
		log.Println("cache hit")
		data, err := utils.GzipDecompress(cached)
		if err != nil {
			log.Println("Decompression error:", err)
			// Continue to fetch fresh data
		} else {
			return c.JSON(fiber.Map{cacheKey: string(data)})
		}
	}

	//check symbols
	if len(Stocksymbols) == 0 {
		return c.Status(500).JSON(fiber.Map{"error": "no symbols"})
	}
	// 2. Fetch data for all symbols and collect into a map
	marketData := make(map[string]interface{})
	for _, sym := range Stocksymbols {
		price, err := GetStockData(c, sym)
		if err != nil {
			log.Printf("Error fetching data for %s: %v", sym, err)
			continue // Skip failed symbols
		}
		//sleep for 2 sec to avoid rate limit
		time.Sleep(2 * time.Second)
		// Assuming price is JSON bytes; store as string for consistency
		marketData[sym] = string(price)
	}

	// 3. Convert collected data to JSON string
	dataBytes, err := json.Marshal(marketData)
	if err != nil {
		log.Println("JSON marshal error:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to process market data"})
	}

	// 4. Compress and cache the full data
	compressed, err := utils.GzipCompress(dataBytes)
	if err != nil {
		log.Println("Compression error:", err)
		// Still return data even if caching fails
	} else {
		if err = config.Redis.Client.Set(ctx, cacheKey, compressed, 4*time.Hour).Err(); err != nil {
			log.Println("Redis set error:", err)
		} else {
			log.Println("Data cached in Redis")
		}
	}

	// 5. Return the data
	return c.JSON(fiber.Map{cacheKey: string(dataBytes)})
}
