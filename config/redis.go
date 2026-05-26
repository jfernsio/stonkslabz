package config

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

type RedisInstance struct {
	Client *redis.Client
}

var Redis RedisInstance

func InitRedis() {
	rdb := redis.NewClient(&redis.Options{
		Addr:     "redis-15165.crce281.ap-south-1-3.ec2.cloud.redislabs.com:15165",
		Username: "default",
		Password: "83XPTPeAYBAobwLxfB6x0Z7vqzQqQXdB",
		DB:       0,
	})
	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}

	Redis = RedisInstance{Client: rdb}
	log.Println("Connected to Redis successfully")
}
