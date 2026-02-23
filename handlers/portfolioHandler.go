package handlers

import (
	"jfernsio/stonksbackend/config"
	"jfernsio/stonksbackend/database"
	"jfernsio/stonksbackend/models"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/shopspring/decimal"
)

type PortfolioResponse struct {
	TotalBalance     string `json:"total_balance"`
	CashBalance      string `json:"cash_balance"`
	HoldingsValue    string `json:"holdings_value"`
	TotalInvested    string `json:"total_invested"`
	PercentageChange string `json:"percentage_change"`
	TodayPnL         string `json:"today_pnl"`
	TotalReturn      string `json:"total_return"`
	RealizedPnL      string `json:"realized_pnl"`
	UnrealizedPnL    string `json:"unrealized_pnl"`
}

func PortfolioHandler(c *fiber.Ctx) error {
	cfg := c.Locals("config").(*config.Config)
	fihubApi := cfg.FinHub
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	// Fetch wallet
	var wallet models.Wallet
	if err := database.Database.Db.Where("user_id = ?", userID).First(&wallet).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Wallet not found"})
	}

	// Fetch holdings
	var holdings []models.Holding
	if err := database.Database.Db.Where("wallet_id = ?", wallet.ID).Find(&holdings).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch holdings"})
	}
	//save to redis for further use

	// Fetch transactions
	var transactions []models.Transaction
	if err := database.Database.Db.Where("wallet_id = ?", wallet.ID).Find(&transactions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch transactions"})
	}
	//save to redis

	// Initialize decimals
	cashBalance := wallet.Balance
	holdingsValue := decimal.Zero
	totalInvested := decimal.Zero
	todayPnL := decimal.Zero
	realizedPnL := decimal.Zero
	unrealizedPnL := decimal.Zero

	// Get today's date
	today := time.Now().Truncate(24 * time.Hour)

	// Calculate total invested and realized P&L
	for _, tx := range transactions {
		if tx.Type == models.Buy {
			totalInvested = totalInvested.Add(tx.TotalAmount)
		}
		realizedPnL = realizedPnL.Add(tx.RealizedPnL)

		// Check if transaction is from today
		if tx.CreatedAt.Truncate(24 * time.Hour).Equal(today) {
			todayPnL = todayPnL.Add(tx.RealizedPnL)
		}
	}

	// Calculate holdings value and unrealized P&L
	for _, holding := range holdings {
		//initalize current price var
		var currentPrice decimal.Decimal
		var err error
		//first check holding type
		//if not stock get crypto price
		if holding.Type != models.STOCK {
			currentPrice, err = MarketPrice(holding.Symbol)
		} else {
			// look for stocks
			currentPrice, err = StockMarketPrice(holding.Symbol, fihubApi)

		}
		if err != nil {
			log.Printf("Failed to get price for %s: %v", holding.Symbol, err)
			// Skip this holding or use last known price? For now, skip
			continue
		}

		currentValue := holding.Quantity.Mul(currentPrice)
		holdingsValue = holdingsValue.Add(currentValue)

		// Unrealized P&L = (current_price - avg_buy_price) * quantity
		unrealized := currentPrice.Sub(holding.AvgBuyPrice).Mul(holding.Quantity)
		unrealizedPnL = unrealizedPnL.Add(unrealized)
	}

	// Total balance = cash + holdings value
	totalBalance := cashBalance.Add(holdingsValue)

	// Total return = realized + unrealized
	totalReturn := realizedPnL.Add(unrealizedPnL)

	// Percentage change = (total_balance - total_invested) / total_invested * 100
	percentageChange := decimal.Zero
	if !totalInvested.IsZero() {
		change := totalBalance.Sub(totalInvested)
		percentageChange = change.Div(totalInvested).Mul(decimal.NewFromInt(100))
	}

	response := PortfolioResponse{
		TotalBalance:     totalBalance.StringFixed(2),
		CashBalance:      cashBalance.StringFixed(2),
		HoldingsValue:    holdingsValue.StringFixed(2),
		TotalInvested:    totalInvested.StringFixed(2),
		PercentageChange: percentageChange.StringFixed(2),
		TodayPnL:         todayPnL.StringFixed(2),
		TotalReturn:      totalReturn.StringFixed(2),
		RealizedPnL:      realizedPnL.StringFixed(2),
		UnrealizedPnL:    unrealizedPnL.StringFixed(2),
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   response,
	})
}
