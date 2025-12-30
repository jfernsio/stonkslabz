package middlewares

import (
	"jfernsio/stonksbackend/utils"

	"github.com/gofiber/fiber/v2"
)

func AuthMiddleware(c *fiber.Ctx) error {
	token := c.Cookies("access_token")
	if token == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "Unauthorized")
	}

	claims, err := utils.VerifyToken(token)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid or expired token")
	}

	//add user info to context
	c.Locals("user_id", (*claims)["user_id"].(uint))
	c.Locals("username", (*claims)["username"].(string))

	return c.Next()
}
