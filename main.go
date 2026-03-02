package main

import (
	"jfernsio/stonksbackend/config"
	"jfernsio/stonksbackend/database"
	"jfernsio/stonksbackend/handlers"
	"jfernsio/stonksbackend/middlewares"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	if _, exists := os.LookupEnv("RAILWAY_ENVIRONMENT_NAME"); !exists {
		err := godotenv.Load()
		if err != nil {
			log.Println("Error loading .env file")
		}
	}
	cfg := config.LoadConfig() //load config once

	app := fiber.New(fiber.Config{
		AppName: "StonksLab",
	})
	config.InitRedis()
	database.ConnectToDB()
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowCredentials: true,
	}))
	//middleare to add conf in evr req context
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("config", cfg) // Store config in locals (accessible in all handlers)
		return c.Next()
	})
	api := app.Group("/api")

	v1 := api.Group("/v1")
	v1.Post("/signin", handlers.UserLogin)
	v1.Post("/signup", handlers.UserSignup)

	//protected routes grp
	protected := v1.Group("", middlewares.AuthMiddleware) // Apply auth middleware to all routes in this group

	protected.Get("/logout", handlers.UserLogout)
	//market routes
	protected.Get("insider-data", handlers.RecentTransactions)
	protected.Get("insider-data/:symbol", handlers.GetInsiderData)
	protected.Get("ipo", handlers.GetIpoData)
	protected.Get("stocks", handlers.GetStockData)
	protected.Get("cryptos", handlers.GetCryptoData)
	protected.Get("losers", handlers.GetTopLosers)
	protected.Get("gainers", handlers.GetTopGainers)

	protected.Post("/buy-stock/:symbol/:quantity", handlers.BuyStockHandler)
	protected.Post("/sell-stock/:symbol/:quantity", handlers.SellStocksHandler)

	protected.Post("/buy-crypto/:symbol/:quantity", handlers.BuyHandler)
	protected.Post("/sell-crypto/:symbol/:quantity", handlers.SellHandler)

	protected.Get("/insider-sentiment", handlers.GetInsiderSentiment)

	//trade routes to get ticker candles
	v1.Get("/ticker/:symbol", handlers.GetHistoryGeneric(handlers.TwelveDataProvider{}, "history12"))

	//protfoluo routes
	protected.Get("/portfolio", handlers.PortfolioHandler)

	//leaderboard routes
	protected.Get("/leaderboard", handlers.GetLeaderboard)
	protected.Get("/leaderboard/rank", handlers.GetUserRank)

	protected.Get("/history", handlers.GetHistory)
	protected.Get("/watchlist", handlers.GetWatchList)
	protected.Post("/watchlist", handlers.AddWatchList)
	protected.Delete("/watchlist/:symbol", handlers.DeletWatchList)
	log.Fatal(app.Listen(":8000"))

}
