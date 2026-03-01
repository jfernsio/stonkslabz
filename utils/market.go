package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"jfernsio/stonksbackend/config"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3/client"
)

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

func GetStockData(ctx context.Context, symbols []string, apikey string) ([]tweleDataResp, error) {
	cacheKey := "stock_market_data:" + strings.Join(symbols, ",")

	// Cache check
	if cached, err := config.Redis.Client.Get(ctx, cacheKey).Bytes(); err == nil {
		data, err := GzipDecompress(cached)
		if err == nil {
			var stocks []tweleDataResp
			if err := json.Unmarshal(data, &stocks); err == nil {
				log.Println("cache hit")
				return stocks, nil
			}
		}
	}

	url := fmt.Sprintf(
		"https://api.twelvedata.com/quote?symbol=%s&apikey=%s",
		strings.Join(symbols, ","),
		apikey,
	)
	log.Println("searching for", url)
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	resp, err := cc.Get(url)
	if err != nil {
		return nil, err
	}
	body := resp.Body()
	var apiResp map[string]tweleDataResp
	if err := json.Unmarshal(body, &apiResp); err != nil {
		log.Println("JSON Unmarshal error:", err)
		return nil, err
	}

	var result []tweleDataResp
	for _, stock := range apiResp {
		result = append(result, stock)
	}
	log.Println("Stack data for watchlist:", result)
	jsonData, _ := json.Marshal(result)
	if compressed, err := GzipCompress(jsonData); err == nil {
		_ = config.Redis.Client.Set(ctx, cacheKey, compressed, 5*time.Minute).Err()
	}

	return result, nil
}
