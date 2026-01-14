package middlewares

import (
	"jfernsio/stonksbackend/utils"
	"log"

	"github.com/gofiber/fiber/v2"
)

func AuthMiddleware(c *fiber.Ctx) error {
	token := c.Cookies("access_token")
	log.Println("token recevied",token)
	if token == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "Unauthorized")
	}

	claims, err := utils.VerifyToken(token)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid or expired token")
	}

	//JWT libraries decode numbers in jwt.MapClaims as float64, not uint
userIDFloat, ok := (*claims)["user_id"].(float64)
if !ok {
	return fiber.NewError(fiber.StatusUnauthorized, "Invalid token payload")
}
 //convert to uint n pass
userID := uint(userIDFloat)
//add user info to context
c.Locals("user_id", userID)
c.Locals("username", (*claims)["username"].(string))

log.Println("going forward")
return c.Next()
}
