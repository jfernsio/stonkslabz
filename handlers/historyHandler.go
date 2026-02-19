package handlers

import (
	"jfernsio/stonksbackend/database"
	"jfernsio/stonksbackend/models"
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func GetHistory(c *fiber.Ctx) error {
	//get user id
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	//get recent rtransactions based on user id
	log.Println(userID)

	//paginate the res
	page, _ := strconv.Atoi(c.Query("page", "1"))
	if page < 1 {
		page = 1
	}
	limit := 10
	offset := (page - 1) * limit

	var transactions []models.Transaction
	err := database.Database.Db.
		Joins("JOIN wallets ON wallets.id = transactions.wallet_id").
		Where("wallets.user_id = ?", userID).
		Order("transactions.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&transactions).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch transactions",
		})
	}

	type Stats struct {
		TotalTrades int64
		TotalPnL    float64
		WinTrades   int64
		TotalVolume float64
	}

	var stats Stats
	err = database.Database.Db.Model(&models.Transaction{}).
		Joins("JOIN wallets ON wallets.id = transactions.wallet_id").
		//secnd qury to ger stats
		//COALESCE avoids NULL when no rows exist
		Select(`
		COUNT (*) as total_trades,
		COALESCE(SUM(realized_pn_l),0) as total_pnl,  
		SUM(CASE WHEN realized_pn_l > 0 THEN 1 ELSE 0 END) as win_trades,
		COALESCE(SUM(total_amount),0) as total_volume
		`).Where("wallets.user_id = ?", userID).
		Scan(&stats).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to calculate stats"})
	}

	winRate := 0.0
	if stats.TotalTrades > 0 {
		winRate = (float64(stats.WinTrades) / float64(stats.TotalTrades)) * 100
	}

	return c.JSON(fiber.Map{
		"page":  page,
		"limit": limit,
		"stats": fiber.Map{
			"total_trades": stats.TotalTrades,
			"total_pnl":    stats.TotalPnL,
			"win_rate":     winRate,
			"total_volume": stats.TotalVolume,
		},
		"transactions": transactions,
	})
}
