package models

import "time"

type Watchlist struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null;uniqueIndex:idx_user_symbol"`
	Symbol    string    `json:"symbol" gorm:"not null;uniqueIndex:idx_user_symbol"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
