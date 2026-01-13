package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type TransactionType string

const (
	Buy  TransactionType = "BUY"
	Sell TransactionType = "SELL"
)

type Transaction struct {
	ID           uint            `json:"id" gorm:"primaryKey"`
	WalletID     uint            `json:"wallet_id" gorm:"not null;index"`
	Symbol       string          `json:"symbol" gorm:"not null"`
	Quantity     uint64          `json:"quantity" gorm:"not null"`
	Type         TransactionType `json:"type" gorm:"type:varchar(10);not null"`
	PricePerUnit decimal.Decimal `json:"price_per_unit" gorm:"not null;type:decimal(20,8)"`
	TotalAmount  decimal.Decimal `json:"total_amount" gorm:"not null;type:decimal(20,8)"`
	RealizedPnL  int64           `json:"realized_pnl" gorm:"default:0"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`

	Wallet Wallet `gorm:"foreignKey:WalletID"`
}
