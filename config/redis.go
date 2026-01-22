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
		Addr:     "redis-14727.crce263.ap-south-1-1.ec2.cloud.redislabs.com:14727",
		Username: "default",
		Password: "g2PMOora7qhUin9ehzNdHWQE1yca02Hq",
		DB:       0,
	})
	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}

	Redis = RedisInstance{Client: rdb}
	log.Println("Connected to Redis successfully")
}
