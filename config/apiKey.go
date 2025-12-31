package config

import (
		"os"
)

type Config struct {
	CoinGecko string
	FMP string
	FinHub string
}

func LoadConfig() *Config {
	return &Config {
		CoinGecko : os.Getenv("CoinGecko"),
		FMP : os.Getenv("FMP"),
		FinHub : os.Getenv("FINHUB"),
	}
}