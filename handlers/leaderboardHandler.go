package handlers

import (
	"context"
	"fmt"
	"jfernsio/stonksbackend/config"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
)

// LeaderboardEntry represents a single leaderboard entry
type LeaderboardEntry struct {
	UserID   uint    `json:"user_id"`
	Username string  `json:"username"`
	Balance  float64 `json:"balance"`
	Rank     int     `json:"rank"`
}

// GetLeaderboard retrieves the top users from the leaderboard with usernames
func GetLeaderboard(c *fiber.Ctx) error {
	ctx := c.Context()

	// Get top 10 users by score (highest balance first)
	users, err := config.Redis.Client.ZRevRangeWithScores(ctx, "leaderboard:all_time", 0, 9).Result()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch leaderboard"})
	}

	// Get all usernames from hash
	usernameMap, err := config.Redis.Client.HGetAll(ctx, "leaderboard:usernames").Result()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch usernames"})
	}

	// Build response with usernames
	var response []LeaderboardEntry
	for rank, user := range users {
		userID, ok := user.Member.(uint)
		if !ok {
			// Try to parse as uint from interface
			userIDStr, ok := user.Member.(string)
			if !ok {
				continue
			}
			id, err := strconv.ParseUint(userIDStr, 10, 64)
			if err != nil {
				continue
			}
			userID = uint(id)
		}

		username := usernameMap[fmt.Sprint(userID)]
		if username == "" {
			username = "Unknown"
		}

		response = append(response, LeaderboardEntry{
			UserID:   userID,
			Username: username,
			Balance:  user.Score,
			Rank:     rank + 1,
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   response,
	})
}

// UpdateLeaderboard updates a user's score in the leaderboard
// This should be called after any trade that changes the user's portfolio value
func UpdateLeaderboard(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	ctx := c.Context()

	// Get user's current balance from Redis or database
	balanceStr, err := config.Redis.Client.HGet(ctx, "leaderboard:balances", fmt.Sprint(userID)).Result()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get user balance"})
	}

	balance, err := strconv.ParseFloat(balanceStr, 64)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Invalid balance value"})
	}

	// Update the sorted set with new score
	if err := config.Redis.Client.ZAdd(ctx, "leaderboard:all_time", redis.Z{
		Score:  balance,
		Member: userID,
	}).Err(); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update leaderboard"})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Leaderboard updated",
	})
}

// UpdateUserBalance updates a specific user's balance in the leaderboard
// This is a helper function that can be called from trade handlers
func UpdateUserBalance(userID uint, newBalance float64) error {
	ctx := context.Background()

	// Update sorted set
	if err := config.Redis.Client.ZAdd(ctx, "leaderboard:all_time", redis.Z{
		Score:  newBalance,
		Member: userID,
	}).Err(); err != nil {
		return err
	}

	// Update balance in hash
	if err := config.Redis.Client.HSet(ctx, "leaderboard:balances", fmt.Sprint(userID), fmt.Sprintf("%.2f", newBalance)).Err(); err != nil {
		return err
	}

	return nil
}

// GetUserRank returns the rank of a specific user
func GetUserRank(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	ctx := c.Context()

	// Get user's rank (0-indexed, so add 1)
	rank, err := config.Redis.Client.ZRevRank(ctx, "leaderboard:all_time", fmt.Sprint(userID)).Result()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get user rank"})
	}

	// Get user's score
	score, err := config.Redis.Client.ZScore(ctx, "leaderboard:all_time", fmt.Sprint(userID)).Result()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get user score"})
	}

	// Get username
	username, err := config.Redis.Client.HGet(ctx, "leaderboard:usernames", fmt.Sprint(userID)).Result()
	if err != nil {
		username = "Unknown"
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"user_id":  userID,
			"username": username,
			"balance":  score,
			"rank":     rank + 1,
		},
	})
}
