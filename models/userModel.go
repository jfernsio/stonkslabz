package models

import "time"

type UserModel struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserName string    `json:"user_name" gorm:"text;uniqueIndex;not null"`
	Email     string    `json:"email" gorm:"text;uniqueIndex;not null"`
	Password  string    `json:"password"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}