package handlers

import (
	"encoding/json"
	"fmt"
	"jfernsio/stonksbackend/config"
	"jfernsio/stonksbackend/utils"
	"log"
	"sort"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v3/client"
)

type InsiderResponse struct {
	Data []Transaction `json:"data"`
}

type Transaction struct {
	Change           float64 `json:"change"` // Can be negative
	Currency         string  `json:"currency"`
	FilingDate       string  `json:"filingDate"` // "YYYY-MM-DD"
	ID               string  `json:"id"`
	IsDerivative     bool    `json:"isDerivative"`
	Name             string  `json:"name"`
	Share            float64 `json:"share"` // Using float64 covers fractional shares if they occur
	Source           string  `json:"source"`
	Symbol           string  `json:"symbol"`
	TransactionCode  string  `json:"transactionCode"`
	TransactionDate  string  `json:"transactionDate"`
	TransactionPrice float64 `json:"transactionPrice"` // Handles "271.23" and "0"
}

type ResponseToSend struct {
	Name             string  `json:"name"`
	Symbol           string  `json:"symbol"`
	TransactionDate  string  `json:"transactionDate"`
	Share            float64 `json:"share"`
	TransactionPrice float64 `json:"transactionPrice"`
	Change           float64 `json:"change"`
}

func RecentTransactions(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	finhubApi := cfg.FinHub
	cacheKey := "recentTransactions"
	ctx := c.Context()
	cached, err := config.Redis.Client.Get(ctx, cacheKey).Bytes()
	if err == nil && len(cached) > 0 {
		data, decErr := utils.GzipDecompress(cached)
		if decErr == nil {
			return c.JSON(fiber.Map{"data": json.RawMessage(data)})
		}
		log.Printf("decompress failed: %v", decErr)
	}

	// 1. Get symbols from Query Params (e.g. ?symbols=AAPL,NFLX)
	// Or you can hardcode your slice here: symbols := []string{"AAPL", "NFLX"}
	symbols := Stocksymbols
	// rawSymbols := c.Query("symbols")
	// if rawSymbols == "" {
	// 	return c.Status(400).JSON(fiber.Map{"error": "No symbols provided"})
	// }
	// symbols := strings.Split(rawSymbols, ",")

	// This slice will hold our final clean data to send back
	var results []ResponseToSend

	// Reuse client for performance
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// 2. Loop over the symbols slice
	for _, sym := range symbols {
		cleanSymbol := strings.ToUpper(strings.TrimSpace(sym))
		if cleanSymbol == "" {
			continue
		}

		url := fmt.Sprintf("https://finnhub.io/api/v1/stock/insider-transactions?symbol=%s", cleanSymbol)

		resp, err := cc.Get(url, client.Config{
			Header: map[string]string{
				"X-Finnhub-Token": finhubApi,
			},
		})
		if err != nil {
			// Log error but continue to next symbol? Or fail?
			// For now, we print and skip.
			fmt.Printf("Error fetching %s: %v\n", cleanSymbol, err)
			continue
		}

		var insiderinfo InsiderResponse
		if err := json.Unmarshal(resp.Body(), &insiderinfo); err != nil {
			fmt.Printf("Error parsing %s: %v\n", cleanSymbol, err)
			continue
		}

		// Check if we actually got data
		if len(insiderinfo.Data) == 0 {
			continue
		}

		// 3. Sort by Date (Newest to Oldest)
		// Since format is YYYY-MM-DD, string sort works perfectly
		sort.Slice(insiderinfo.Data, func(i, j int) bool {
			return insiderinfo.Data[i].TransactionDate > insiderinfo.Data[j].TransactionDate
		})

		// 4. Get the first (latest) transaction
		latestTx := insiderinfo.Data[0]

		// 5. Map to your Clean Struct
		toSend := ResponseToSend{
			Name:             latestTx.Name,
			Symbol:           latestTx.Symbol,
			TransactionDate:  latestTx.TransactionDate,
			Share:            latestTx.Share,
			TransactionPrice: latestTx.TransactionPrice,
			Change:           latestTx.Change,
		}

		// Store in our results slice
		results = append(results, toSend)

		plainJson, err := json.Marshal(results)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Serialization error"})

		}
		compressed, compErr := utils.GzipCompress(plainJson)
		if compErr == nil {
			_ = config.Redis.Client.Set(ctx, cacheKey, compressed, 45*time.Minute).Err()
			// 45 min is usually good balance — AlphaVantage has rate limits
		}
	}

	// 6. Return all values
	return c.JSON(fiber.Map{"data": results})
}
