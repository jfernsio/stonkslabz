package utils

import (
	"fmt"
	"testing"
)

func TestGenerateToken(t *testing.T) {
	fmt.Println("Starting unit tests for jwt.go")

	fmt.Println("Testing GenerateToken function")

	userID := uint(12345)

	token, err := GenerateToken(userID, "john")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if token == "" {
		t.Fatalf("Expected token to be non empty")
	}
}

func TestVerifyToken(t *testing.T) {
	fmt.Println("Testing VerifyToken function")

	userID := uint(12345)

	token, err := GenerateToken(userID, "john")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if token == "" {
		t.Fatalf("Expected token to be non empty")
	}

	claims, err := VerifyToken(token)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	fmt.Printf("Type of claims user_id: %T\n", (*claims)["user_id"])
	fmt.Println("This test case will always fail as userID is returned as float")

	if (*claims)["user_id"] != userID {
		t.Fatalf("Expected user_id to be %v, got %v", userID, (*claims)["user_id"])
	}

	if (*claims)["user_name"] != "john" {
		t.Fatalf("Expected user_name to be john, got %v", (*claims)["user_name"])
	}

}
