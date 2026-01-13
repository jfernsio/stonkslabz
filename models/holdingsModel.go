package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type HoldingType string

const (
	STOCK  HoldingType = "STOCK"
	CRYPTO HoldingType = "CRYPTO"
)

type Holding struct {
	ID          uint            `json:"id" gorm:"primaryKey"`
	WalletID    uint            `json:"wallet_id" gorm:"not null;uniqueIndex:idx_wallet_symbol"`
	Symbol      string          `json:"symbol" gorm:"not null;uniqueIndex:idx_wallet_symbol"`
	Quantity    decimal.Decimal `json:"quantity" gorm:"not null; type:decimal(20,8)"`
	AvgBuyPrice decimal.Decimal `json:"avg_buy_price" gorm:"not null; type:decimal(20,8)" `
	Type        HoldingType     `json:"type" gorm:"type:varchar(10);not null"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}
