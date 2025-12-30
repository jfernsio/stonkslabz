package handlers

import (
	"errors"
	"jfernsio/stonksbackend/database"
	"jfernsio/stonksbackend/models"
	"jfernsio/stonksbackend/utils"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func UserSignup(c *fiber.Ctx) error {
	var payload models.UserModel

	if err := c.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	payload.Email = strings.ToLower(strings.TrimSpace(payload.Email))
	payload.UserName = strings.TrimSpace(payload.UserName)

	if payload.Email == "" || payload.Password == "" || payload.UserName == "" {
		return fiber.NewError(fiber.StatusBadRequest, "All fields are required")
	}

	hashedPassword, err := HashPassword(payload.Password)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Password hashing failed")
	}

	user := models.UserModel{
		Email:    payload.Email,
		UserName: payload.UserName,
		Password: hashedPassword,
	}

	if err := database.Database.Db.Create(&user).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			return fiber.NewError(fiber.StatusConflict, "Email or username already exists")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to create user")
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "User registered successfully",
	})
}


func UserLogin(c *fiber.Ctx) error {
	type LoginPayload struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var payload LoginPayload

	if err := c.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body")
	}

	payload.Email = strings.ToLower(strings.TrimSpace(payload.Email))

	if payload.Email == "" || payload.Password == "" {
		return fiber.NewError(fiber.StatusBadRequest, "All fields are required")
	}

	var user models.UserModel
	err := database.Database.Db.
		Where("email = ?", payload.Email).
		First(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusUnauthorized, "Invalid email")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Database error")
	}

	if ok, _ := VerifyPassword(user.Password, payload.Password); !ok {
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid password")
	}

	token, err := utils.GenerateToken(user.ID, user.UserName)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Token generation failed")
	}

	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    token,
		HTTPOnly: true,
		Secure:   true,          
		SameSite: fiber.CookieSameSiteStrictMode,
		Path:     "/",
		Expires:  time.Now().Add(72 * time.Hour),
	})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Logged in successfully",
	})
}

func UserLogout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
		Secure:   true,
		Path:     "/",
	})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Logged out successfully",
	})
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		log.Panic(err)
	}

	return string(bytes), nil
}

func VerifyPassword(hashedPassword, password string) (bool, error) {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return false, err
	}
	return true, nil
}
