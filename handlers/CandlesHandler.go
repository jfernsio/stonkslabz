package handlers

import (
	"encoding/json"
	"fmt"
	"jfernsio/stonksbackend/config"
	"jfernsio/stonksbackend/utils"
	"log"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	fiberclient "github.com/gofiber/fiber/v3/client"
)

type Candle struct {
	Time   string  `json:"time"` // yyyy-mm-dd or yyyy-mm-ddThh:mm:ss
	Open   float64 `json:"open"`
	High   float64 `json:"high"`
	Low    float64 `json:"low"`
	Close  float64 `json:"close"`
	Volume float64 `json:"volume"`
}

type Provider interface {
	Name() string
	BuildURL(symbol, interval string, cfg *config.Config) string
	ParseResponse(body []byte) ([]Candle, error)
}

var httpClient = fiberclient.New().
	SetTimeout(12 * time.Second).
	SetUserAgent("stonksbackend/2.0 (compatible; +https://github.com/jfernsio/stonksbackend)") // optional

var mu sync.Mutex // protects client creation if you ever need custom per-request settings

func mustParseFloat(s string) float64 {
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		log.Printf("invalid float %q → using 0", s)
		return 0
	}
	return v
}

type AlphaVantageProvider struct{}

func (p AlphaVantageProvider) Name() string { return "alphavantage" }

func (p AlphaVantageProvider) BuildURL(symbol, _ string, cfg *config.Config) string {
	return fmt.Sprintf(
		"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=%s&outputsize=compact&apikey=%s",
		symbol, cfg.Alpha,
	)
}

func (p AlphaVantageProvider) ParseResponse(body []byte) ([]Candle, error) {
	var resp struct {
		TimeSeries map[string]struct {
			Open   string `json:"1. open"`
			High   string `json:"2. high"`
			Low    string `json:"3. low"`
			Close  string `json:"4. close"`
			Volume string `json:"5. volume"`
		} `json:"Time Series (Daily)"`
	}

	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}

	if len(resp.TimeSeries) == 0 {
		return nil, fmt.Errorf("no time series data")
	}

	candles := make([]Candle, 0, len(resp.TimeSeries))
	for date, d := range resp.TimeSeries {
		candles = append(candles, Candle{
			Time:   date,
			Open:   mustParseFloat(d.Open),
			High:   mustParseFloat(d.High),
			Low:    mustParseFloat(d.Low),
			Close:  mustParseFloat(d.Close),
			Volume: mustParseFloat(d.Volume),
		})
	}

	// Alpha Vantage compact usually returns newest first → reverse to oldest first
	sort.Slice(candles, func(i, j int) bool {
		return candles[i].Time < candles[j].Time
	})

	return candles, nil
}

type TwelveDataProvider struct{}

func (p TwelveDataProvider) Name() string { return "twelvedata" }

func (p TwelveDataProvider) BuildURL(symbol, interval string, cfg *config.Config) string {
	if interval == "" {
		interval = "1day"
	}
	return fmt.Sprintf(
		"https://api.twelvedata.com/time_series?symbol=%s&interval=%s&outputsize=500&apikey=%s",
		symbol, interval, cfg.TweleCandle, // ← fixed typo in config field name?
	)
}

func (p TwelveDataProvider) ParseResponse(body []byte) ([]Candle, error) {
	var resp struct {
		Values []struct {
			Datetime string `json:"datetime"`
			Open     string `json:"open"`
			High     string `json:"high"`
			Low      string `json:"low"`
			Close    string `json:"close"`
			Volume   string `json:"volume"`
		} `json:"values"`
	}

	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}

	if len(resp.Values) == 0 {
		return nil, fmt.Errorf("no values in response")
	}

	candles := make([]Candle, len(resp.Values))
	for i, v := range resp.Values {
		// Twelve Data usually returns newest first too
		candles[i] = Candle{
			Time:   strings.Split(v.Datetime, " ")[0], // keep only date if time is present
			Open:   mustParseFloat(v.Open),
			High:   mustParseFloat(v.High),
			Low:    mustParseFloat(v.Low),
			Close:  mustParseFloat(v.Close),
			Volume: mustParseFloat(v.Volume),
		}
	}

	// Make oldest → newest
	sort.Slice(candles, func(i, j int) bool {
		return candles[i].Time < candles[j].Time
	})

	return candles, nil
}

func GetHistoryGeneric(provider Provider, cachePrefix string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		symbol := strings.ToUpper(c.Params("symbol"))
		if symbol == "" {
			return c.Status(400).JSON(fiber.Map{"error": "symbol is required"})
		}

		interval := c.Query("interval") // used only by twelvedata

		cacheKey := fmt.Sprintf("%s:%s:%s", cachePrefix, symbol, interval)

		ctx := c.Context()

		// 1. Try cache
		cached, err := config.Redis.Client.Get(ctx, cacheKey).Bytes()
		if err == nil && len(cached) > 0 {
			data, decErr := utils.GzipDecompress(cached)
			if decErr == nil {
				return c.JSON(fiber.Map{"data": json.RawMessage(data)})
			}
			log.Printf("decompress failed: %v", decErr)
		}

		// 2. Fetch
		cfg := c.Locals("config").(*config.Config)
		url := provider.BuildURL(symbol, interval, cfg)

		resp, err := httpClient.Get(url)
		if err != nil {
			return c.Status(502).JSON(fiber.Map{"error": "upstream fetch failed"})
		}
		defer resp.Body()

		if resp.StatusCode() != 200 {
			return c.Status(502).JSON(fiber.Map{
				"error":  "upstream error",
				"status": resp.StatusCode(),
				"body":   string(resp.Body()),
			})
		}

		// 3. Parse & normalize
		candles, err := provider.ParseResponse(resp.Body())
		if err != nil {
			log.Printf("%s parse error: %v", provider.Name(), err)
			return c.Status(502).JSON(fiber.Map{"error": "invalid upstream response"})
		}

		// 4. Serialize → compress → cache
		plainJSON, _ := json.Marshal(candles) // almost never fails here

		compressed, compErr := utils.GzipCompress(plainJSON)
		if compErr == nil {
			_ = config.Redis.Client.Set(ctx, cacheKey, compressed, 45*time.Minute).Err()
			// 45 min is usually good balance — AlphaVantage has rate limits
		}

		// 5. Return
		return c.JSON(fiber.Map{"data": candles})
	}
}
