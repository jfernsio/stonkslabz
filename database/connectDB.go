package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DbInstance struct {
	DB *gorm.DB
}

func ConnectToDB () {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	connStr := os.Getenv("DATABASE_URL")
	db, err := gorm.Open(postgres.Open(connStr), &gorm.Config{})

	if err != nil {
		log.Fatal("failed to connect to databse", err.Error())
		os.Exit(2)
	}

	sql, err := db.DB()
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := sql.PingContext(ctx); err != nil {
		log.Fatalf(" db ping failed: %v", err)
	}

	log.Println("Connnected to db succesfully")
	log.Println("Running migrations")

	//run migartions
	if err := DbMigartions(db); err != nil {
		log.Fatalln("FAiled to run migratations", err)
	}

	
}




