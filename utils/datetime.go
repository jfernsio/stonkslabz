package utils

import (
	"time"
)

// GetDateTime returns current date and time in America/New_York timezone
// Format examples:
//
//	Date: "2025-04-15"
//	Time: "14:35:22"
func GetDateTime() (string, string) {
	// Load New York timezone (EST/EDT = UTC-5 / UTC-4)
	loc, err := time.LoadLocation("America/New_York")
	if err != nil {
		// Fallback to UTC if location loading fails (very rare)
		loc = time.UTC
	}

	// Get current time in the desired timezone
	now := time.Now().In(loc)

	// Format date as YYYY-MM-DD
	dateStr := now.Format("2006-01-02")

	// Format time as HH:MM:SS (24-hour)
	timeStr := now.Format("15:04:05")

	return dateStr, timeStr
}
