package handlers

import (
	"errors"
	"fmt"
	"jfernsio/stonksbackend/config"
	"jfernsio/stonksbackend/database"
	"jfernsio/stonksbackend/models"
	"jfernsio/stonksbackend/utils"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type WatchlistItem struct {
	Symbol        string `json:"symbol"`
	CurrentPrice  string `json:"price"`
	PercentChange string `json:"percent_change"`
}

const MaxWatchlsitSize = 16

func GetWatchList(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	cfg := c.Locals("config").(*config.Config)
	twele := cfg.Twele

	var symbols []string
	err := database.Database.Db.
		Model(&models.Watchlist{}).
		Where("user_id = ?", userID).
		Pluck("symbol", &symbols).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Failed to fetch watchlist"})
	}

	if len(symbols) == 0 {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "Nothing in watchlist yet"})
	}

	stocks, err := utils.GetStockData(c.Context(), symbols, twele)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "Market data fetch failed"})
	}
	response := make([]WatchlistItem, 0, len(stocks))
	for _, s := range stocks {
		response = append(response, WatchlistItem{
			Symbol:        s.Symbol,
			CurrentPrice:  s.Price,
			PercentChange: s.PercentChange,
		})
	}

	return c.JSON(response)
}

func AddWatchList(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	type request struct {
		Symbol string `json:"symbol"`
	}

	var body request
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	symbol := strings.ToUpper(strings.TrimSpace(body.Symbol))
	if symbol == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Symbol is required"})
	}

	err := database.Database.Db.Transaction(func(tx *gorm.DB) error {
		var count int64
		if err := tx.Model(&models.Watchlist{}).
			Where("user_id = ?", userID).
			Count(&count).Error; err != nil {
			return err
		}

		if count >= MaxWatchlsitSize {
			return fiber.NewError(
				fiber.StatusBadRequest,
				fmt.Sprintf("Watchlist limit of %d reached", MaxWatchlsitSize),
			)
		}

		item := models.Watchlist{
			UserID: userID,
			Symbol: symbol,
		}

		if err := tx.Create(&item).Error; err != nil {
			if errors.Is(err, gorm.ErrDuplicatedKey) {
				return fiber.NewError(
					fiber.StatusConflict,
					"Symbol already in watchlist",
				)
			}
			return err
		}

		return nil // auto-commit
	})

	if err != nil {
		return err
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Added to watchlist",
		"symbol":  symbol,
	})
}

func DeletWatchList(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	log.Println(userID)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	return nil
}
