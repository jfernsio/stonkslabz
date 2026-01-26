package handlers

import (
	"encoding/json"
	"fmt"
	"jfernsio/stonksbackend/config"
	"log"
	"sort"
	"strings"

	"time"

	"jfernsio/stonksbackend/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v3/client"
)

var Stocksymbols = []string{"AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX"}

type tweleDataResp struct {
	Symbol        string `json:"symbol"`
	Name          string `json:"name"`
	Open          string `json:"open"`
	High          string `json:"high"`
	Low           string `json:"low"`
	Price         string `json:"close"`
	Volume        string `json:"volume"`
	PercentChange string `json:"percent_change"`
}

type FinhubIpoResp struct {
	Data []Data `json:"ipoCalendar"`
}
type Data struct {
	Date             string  `json:"date"`
	Exchange         string  `json:"exchange"`
	Name             string  `json:"name"`
	Price            string  `json:"price"`
	Status           string  `json:"status"`
	Symbol           string  `json:"symbol"`
	TotalSharesValue float64 `json:"totalSharesValue"`
}

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

func GetStockData(c *fiber.Ctx) error {
	ctx := c.Context()
	cacheKey := "stock_market_data"

	//check cache
	cached, err := config.Redis.Client.Get(ctx, cacheKey).Bytes()
	if err == nil && len(cached) > 0 {
		log.Println("cache hit")
		// Decompress cached data
		data, err := utils.GzipDecompress(cached)
		if err != nil {
			log.Println("Decompression error:", err)
			// If decompression fails, proceed to fetch fresh data
		} else {
			// Return cached data immediately
			// use generic json.RawMessage to avoid re-marshalling
			return c.JSON(fiber.Map{"data": json.RawMessage(data)})
		}
	}

	// Fetch Data
	cfg := c.Locals("config").(*config.Config)
	apiKey := cfg.Twele

	// Join symbols
	symbols := strings.Join(Stocksymbols, ",")
	url := fmt.Sprintf("https://api.twelvedata.com/quote?symbol=%s&apikey=%s", symbols, apiKey)

	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	resp, err := cc.Get(url)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch stock data"})
	}

	// Get raw body bytes
	rawBody := resp.Body()

	//Parse and Filter Data
	// The API returns a MAP: {"AAPL": {...}, "TSLA": {...}}
	// We unmarshal into a map of our 'StockData' struct.
	// This automatically discards fields not defined in StockData.
	var apiResponse map[string]tweleDataResp
	if err := json.Unmarshal(rawBody, &apiResponse); err != nil {
		log.Println("JSON Unmarshal error:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to parse stock data"})
	}

	// Convert Map to Slice (List) for a cleaner JSON response
	var stockList []tweleDataResp
	for _, stock := range apiResponse {
		stockList = append(stockList, stock)
	}

	// Marshal the filtered list back to JSON bytes for caching/response
	finalJSON, err := json.Marshal(stockList)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Serialization error"})
	}

	//compress and Cache
	compressed, err := utils.GzipCompress(finalJSON)
	if err != nil {
		log.Println("Compression error:", err)
	} else {
		// Store in Redis (5 minutes)
		if err = config.Redis.Client.Set(ctx, cacheKey, compressed, 5*time.Minute).Err(); err != nil {
			log.Println("Redis set error:", err)
		} else {
			log.Println("Data cached in Redis")
		}
	}

	return c.JSON(fiber.Map{"data": stockList})
}

func GetIpoData(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	finhub := cfg.FinHub
	cacheKey := "ipodata"
	ctx := c.Context()
	cached, err := config.Redis.Client.Get(ctx, cacheKey).Bytes()
	if err == nil && len(cached) > 0 {
		data, decErr := utils.GzipDecompress(cached)
		if decErr == nil {
			return c.JSON(fiber.Map{"data": json.RawMessage(data)})
		}
		log.Printf("decompress failed: %v", decErr)
	}

	date, _ := utils.GetDateTime()

	url := fmt.Sprintf("https://finnhub.io/api/v1/calendar/ipo?from=2026-01-01&to=%s&token=%s", date, finhub)
	fmt.Println("url ipo", url)
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	resp, err := cc.Get(url)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	var ipoData FinhubIpoResp
	if err := json.Unmarshal(resp.Body(), &ipoData); err != nil {
		log.Println("Error parsin", err)
	}

	// Check if we actually got data
	if len(ipoData.Data) == 0 {
	}

	// 3. Sort by Date (Newest to Oldest)
	// Since format is YYYY-MM-DD, string sort works perfectly
	sort.Slice(ipoData.Data, func(i, j int) bool {
		return ipoData.Data[i].Date > ipoData.Data[j].Date
	})
	limit := 10

	if len(ipoData.Data) < limit {
		limit = len(ipoData.Data)
	}
	latestTx := ipoData.Data[:limit]

	plainJson, err := json.Marshal(latestTx)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Serialization error"})
	}

	compressed, compErr := utils.GzipCompress(plainJson)
	if compErr == nil {
		_ = config.Redis.Client.Set(ctx, cacheKey, compressed, 45*time.Minute).Err()
	}
	return c.JSON(fiber.Map{"data": json.RawMessage(plainJson)})
}

func GetInsiderData(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	finhubApi := cfg.FinHub
	symbol := c.Params("symbol")
	log.Println("llooking for", symbol)
	cacheKey := fmt.Sprintf("insiderTransactions:/%s", symbol)

	ctx := c.Context()
	cached, err := config.Redis.Client.Get(ctx, cacheKey).Bytes()
	if err == nil && len(cached) > 0 {
		data, decErr := utils.GzipDecompress(cached)
		if decErr == nil {
			return c.JSON(fiber.Map{"data": json.RawMessage(data)})
		}
		log.Printf("decompress failed: %v", decErr)
	}

	url := fmt.Sprintf("https://finnhub.io/api/v1/stock/insider-transactions?symbol=%s", strings.ToUpper(symbol))

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
	var insiderinfo InsiderResponse
	if err := json.Unmarshal(resp.Body(), &insiderinfo); err != nil {
		fmt.Printf("Error parsing %s: %v\n", symbol, err)
	}

	// Check if we actually got data
	if len(insiderinfo.Data) == 0 {
	}

	// 3. Sort by Date (Newest to Oldest)
	// Since format is YYYY-MM-DD, string sort works perfectly
	sort.Slice(insiderinfo.Data, func(i, j int) bool {
		return insiderinfo.Data[i].TransactionDate > insiderinfo.Data[j].TransactionDate
	})
	limit := 10

	if len(insiderinfo.Data) < limit {
		limit = len(insiderinfo.Data)
	}
	latestTx := insiderinfo.Data[:limit]

	//map to struct
	var results []ResponseToSend // Define the slice

	for _, tx := range latestTx {
		toSend := ResponseToSend{
			Name:             tx.Name,
			Symbol:           tx.Symbol,
			TransactionDate:  tx.TransactionDate,
			Share:            tx.Share,
			TransactionPrice: tx.TransactionPrice,
			Change:           tx.Change,
		}
		results = append(results, toSend)
	}

	//cahche
	plainJson, err := json.Marshal(results)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Serialization error"})
	}

	compressed, compErr := utils.GzipCompress(plainJson)
	if compErr == nil {
		_ = config.Redis.Client.Set(ctx, cacheKey, compressed, 45*time.Minute).Err()
	}
	return c.JSON(fiber.Map{"data": json.RawMessage(plainJson)})
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
