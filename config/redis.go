package config

import (
	"github.com/redis/go-redis/v9"
)

type RedisInstance struct {
	Client *redis.Client
}

var Redis RedisInstance

func ExampleClient_connect_basic() {

	rdb := redis.NewClient(&redis.Options{
		Addr:     "redis-14727.crce263.ap-south-1-1.ec2.cloud.redislabs.com:14727",
		Username: "default",
		Password: "g2PMOora7qhUin9ehzNdHWQE1yca02Hq",
		DB:       0,
	})

	Redis = RedisInstance{Client: rdb}

}
