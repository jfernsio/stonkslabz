package database

import (
	"jfernsio/stonksbackend/models"

	"gorm.io/gorm"
)

func DbMigrations(db *gorm.DB) error {
	return db.AutoMigrate(&models.UserModel{}, &models.Wallet{}, &models.Holding{}, &models.Transaction{}, &models.Watchlist{}, &models.Leaderboard{})
}
