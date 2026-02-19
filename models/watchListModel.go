package models

import "time"

type Watchlist struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;idx_user_symbol,unique"`
	Symbol    string    `json:"symbol" gorm:"not null;index:idx_user_symbol,unique"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
