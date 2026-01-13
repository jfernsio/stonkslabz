package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type Wallet struct {
	ID           uint            `json:"id" gorm:"primaryKey"`
	UserID       uint            `json:"user_id" gorm:"not null;index"`
	Balance      decimal.Decimal `json:"balance" gorm:"not null;default:100000;type:decimal(20,8)"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
	Transactions []Transaction   `gorm:"foreignKey:WalletID"`
}
