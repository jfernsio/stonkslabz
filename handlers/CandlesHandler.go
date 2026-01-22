package handlers

import (
	"fmt"
	"jfernsio/stonksbackend/config"
	"jfernsio/stonksbackend/utils"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v3/client"
)

func GetHistoryData(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	alphaApi := cfg.Alpha
	log.Println("symbol:", c.Params("symbol"))
	url := fmt.Sprintf("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=%s&outputsize=compact&apikey=%s", c.Params("symbol"), alphaApi)
	log.Println("fetching for", url)
	//check if history data for particular symbol exists in cache
	cachedData, found := config.Redis.Client.Get(c.Context(), "history"+c.Params("symbol")).Bytes()
	if found == nil {
		//cache hit
		log.Println("Cache hit")
		data, err := utils.GzipDecompress(cachedData)
		if err != nil {
			log.Println("Decompression error:", err)
			// Fall through to fetch from API
		} else {
			return c.JSON(fiber.Map{"data": string(data)})
		}
	}

	//fetch from api
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	resp, err := cc.Get(url)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err})
	}
	body := resp.Body()

	//compress data
	compressed, err := utils.GzipCompress(body)
	if err != nil {
		log.Println("Compression error:", err)
	} else {
		//store data in redis for 1hr
		if err = config.Redis.Client.Set(c.Context(), "history"+c.Params("symbol"), compressed, 1*time.Hour).Err(); err != nil {
			log.Println("Error saving to redis")
		} else {
			log.Println("Data cached in redis")
		}
	}
	return c.JSON(fiber.Map{"data": string(body)})
}
