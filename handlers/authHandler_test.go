package handlers

import (
	"fmt"
	"testing"
)

func TestHashPassword(t *testing.T) {
	fmt.Println("Starting Unit Tests for authHandler.go")
	fmt.Println("Testing HashPassword function")

	password := "testpassword"
	hashed, err := HashPassword(password)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if hashed == password {
		t.Fatalf("Expected hashed password to be diffrent from original password")
	}

	if len(hashed) == 0 {
		t.Fatalf("Expected hashed password to be non empty")
	}
}

func TestVerifyPassword(t *testing.T) {
	fmt.Println("Testing VerifyPassword function")

	password := "testpassword"
	hashed, err := HashPassword(password)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	isValid, err := VerifyPassword(hashed, password)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if !isValid {
		t.Fatalf("Expected password to be valid")
	}

	isValid, err = VerifyPassword(hashed, "wrongpassword")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if !isValid {
		t.Fatalf("Expected password to be valid")
	}

}
