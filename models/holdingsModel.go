package models

import "time"

type HoldingsModel struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	WalletID string    `json:"user_name" gorm:"text;uniqueIndex;not null"`
	Symbol     string    `json:"email" gorm:"text;uniqueIndex;not null"`
	Quantity  string    `json:"password"`
	AvgBuyPrice uint64 
	
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}