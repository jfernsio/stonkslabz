package models

import "time"

type WalletModel struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserId string    `json:"user_id"  gorm:"foreignkey:UserID"`
	Balance     string    `json:"balance" gorm:"decimal";default= 100000"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}