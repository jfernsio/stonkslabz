package models

type Leaderboard struct {
	UserId   uint    `json:"user_id"`
	Balance  float64 `json:"balance"`
	Username string  `json:"username"`
}
