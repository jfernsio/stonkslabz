package models

import "time"

type Wallet struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;index"`
	Balance   uint64    `json:"balance" gorm:"not null;default:10000000000000"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Transactions []Transaction `gorm:"foreignKey:WalletID"`
}
