package main

import (
	// "fmt"
	"jfernsio/stonksbackend/handlers"
	"log"
	"os"


	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file")
	}
	a := os.Getenv("Fmp")
	b := os.Getenv("FinHub")
	// handlers.GetMarketData()
	// handlers.GetTopGainers(a)
	handlers.GetStockData(a)
	handlers.GetInsiderSentiment(b)
}