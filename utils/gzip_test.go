package utils

import (
	"fmt"
	"testing"
)

func TestGzipCompress(t *testing.T) {
	fmt.Println("Starting unit tests for gzip.go")

	fmt.Println("Testing GzipCompress function")

	data := []byte("This is a test string to be compressed usging gzip")

	compressed, err := GzipCompress(data)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if len(compressed) == 0 {
		t.Fatalf("Expected compressed string to be non empty")
	}
}

func TestGzipDecompress(t *testing.T) {
	fmt.Println("Testing GzipDecompress function")

	data := []byte("This is a test string to be decompresed using gzip")

	compresed, err := GzipCompress(data)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if len(compresed) == 0 {
		t.Fatalf("Expected compressed string to be non empty")
	}

	decompressed, err := GzipDecompress(compresed)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if string(decompressed) != string(data) {
		t.Fatalf("Expected decompressed string to be %v, got %v", string(data), string(decompressed))
	}
}
