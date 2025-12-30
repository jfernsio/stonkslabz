package models

import "time"

type Holding struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	WalletID    uint      `json:"wallet_id" gorm:"not null;uniqueIndex:idx_wallet_symbol"`
	Symbol      string    `json:"symbol" gorm:"not null;uniqueIndex:idx_wallet_symbol"`
	Quantity    uint64    `json:"quantity" gorm:"not null"`
	AvgBuyPrice uint64    `json:"avg_buy_price" gorm:"not null"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
