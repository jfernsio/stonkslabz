package main

import (
	"jfernsio/stonksbackend/config"
	"jfernsio/stonksbackend/database"
	"jfernsio/stonksbackend/handlers"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	cfg := config.LoadConfig() //load config once

	app := fiber.New(fiber.Config{
		AppName: "StonksLab",
	})

	database.ConnectToDB()
	app.Use(cors.New())
	//middleare to add conf in evr req context
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("config", cfg) // Store config in locals (accessible in all handlers)
		return c.Next()
	})
	api := app.Group("/api")

	v1 := api.Group("/v1")
	v1.Post("/signin", handlers.UserLogin)
	v1.Post("/signup", handlers.UserSignup)
	v1.Get("/logout", handlers.UserLogout)

	//market routes
	v1.Get("/get-stocks", handlers.GetMarketData)
	v1.Get("/get-cryptos", handlers.GetStockData)
	v1.Get("/get-losers", handlers.GetTopLosers)
	v1.Get("/get-gainers", handlers.GetTopGainers)
	v1.Get("/get-ipo", handlers.GetIpoData)
	v1.Get("/get-insider-sentiment", handlers.GetInsiderSentiment)
	v1.Get("/get-insider-data", handlers.GetInsiderData)

	log.Fatal(app.Listen(":8000"))

}
