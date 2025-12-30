package utils

import (
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
)

func LoadEnv() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func GenerateToken(userID uint, userName string) (string, error) {
	method := jwt.SigningMethodHS256
	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": userName,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	}
	token, err := jwt.NewWithClaims(method, claims).SignedString(jwtSecret)
	if err != nil {
		return "", err
	}
	return token, nil
}

func VerifyToken(tokenStr string) (*jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		return jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return &claims, nil
	}
	return nil, err
}
