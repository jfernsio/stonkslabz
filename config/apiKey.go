package config

import (
	"os"
)

type Config struct {
	CoinGecko string
	FMP       string
	FinHub    string
	Alpha     string
	Twele     string
}

func LoadConfig() *Config {
	return &Config{
		CoinGecko: os.Getenv("CoinGecko"),
		FMP:       os.Getenv("FMP"),
		FinHub:    os.Getenv("FINHUB"),
		Alpha:     os.Getenv("ALPHAVANTAGE"),
		Twele:     os.Getenv("TWELE_DATA"),
	}
}
