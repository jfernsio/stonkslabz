package handlers

import (
	"fmt"
	"os"
	"time"

	"github.com/gofiber/fiber/v3/client"
)

var coinApi = os.Getenv("CoinGecko")
// var fmpApi = os.Getenv("Fmp")
// var   finhubApi := os.Getenv("FinHub")

func GetMarketData() {

	url := "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=bitcoin,solana&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"
	fmt.Println("runnomg")
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url, client.Config{
		Header: map[string]string{
			"x-cg-demo-api-key": coinApi,
		},
	})

	fmt.Println("stioed")
	if err != nil {
		panic(err)
	}
	fmt.Println()

	fmt.Printf("Status: %d\n", resp.StatusCode())
	fmt.Printf("Body: %s\n", string(resp.Body()))

}

func GetTopGainers(fmpApi string) {
	url := fmt.Sprintf("https://financialmodelingprep.com/stable/biggest-gainers?apikey=%s", fmpApi)
	fmt.Println("url",fmpApi)
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url)

	fmt.Println("stioed")
	if err != nil {
		panic(err)
	}
	fmt.Println()

	fmt.Printf("Status: %d\n", resp.StatusCode())
	fmt.Printf("Body: %s\n", string(resp.Body()))
}

func GetTopLosers(fmpApi string) {
	url := fmt.Sprintf("https://financialmodelingprep.com/stable/biggest-losers?apikey=%s", fmpApi)
	fmt.Println("url",fmpApi)
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url)

	fmt.Println("stioed")
	if err != nil {
		panic(err)
	}
	fmt.Println()

	fmt.Printf("Status: %d\n", resp.StatusCode())
	fmt.Printf("Body: %s\n", string(resp.Body()))
}

func GetStockData(fmpApi string) {
	url := fmt.Sprintf("https://financialmodelingprep.com/api/stable/quote/AAPL,MSFT,GOOGL,NVDA,TSLA?apikey=%s", fmpApi)
	fmt.Println("url",fmpApi)
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url)

	fmt.Println("stioed")
	if err != nil {
		panic(err)
	}
	fmt.Println()

	fmt.Printf("Status: %d\n", resp.StatusCode())
	fmt.Printf("Body: %s\n", string(resp.Body()))
}

func GetIpoData() {

}

func GetInsiderData() {
	
}

func GetInsiderSentiment(finhubApi string) {
	url := "https://finnhub.io/api/v1/stock/insider-sentiment?symbol=TSLA,NVDA"
	fmt.Println("runnomg")
	cc := client.New()
	cc.SetTimeout(10 * time.Second)

	// Send a GET request
	resp, err := cc.Get(url, client.Config{
		Header: map[string]string{
			"X-Finnhub-Token": finhubApi,
		},
	})

	fmt.Println("stioed")
	if err != nil {
		panic(err)
	}
	fmt.Println()

	fmt.Printf("Status: %d\n", resp.StatusCode())
	fmt.Printf("Body: %s\n", string(resp.Body()))
}