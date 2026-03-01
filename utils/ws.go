package utils

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"

	"github.com/gofiber/websocket/v2"
	gws "github.com/gorilla/websocket"
)

type Client struct {
	Conn   *websocket.Conn
	Symbol string
}

type Hub struct {
	finnhub *gws.Conn

	clients  map[*Client]bool
	bySymbol map[string]map[*Client]bool

	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte

	mu sync.Mutex
}

func NewHub(token string) (*Hub, error) {
	url := fmt.Sprintf("wss://ws.finnhub.io?token=%s", token)

	fh, _, err := gws.DefaultDialer.Dial(url, nil)
	if err != nil {
		return nil, err
	}

	h := &Hub{
		finnhub:    fh,
		clients:    make(map[*Client]bool),
		bySymbol:   make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan []byte),
	}

	go h.run()
	go h.readFinnhub()

	return h, nil
}

func (h *Hub) run() {
	for {
		select {

		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true

			if h.bySymbol[client.Symbol] == nil {
				h.bySymbol[client.Symbol] = make(map[*Client]bool)
				h.subscribe(client.Symbol)
			}
			h.bySymbol[client.Symbol][client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			delete(h.clients, client)
			delete(h.bySymbol[client.Symbol], client)

			if len(h.bySymbol[client.Symbol]) == 0 {
				h.unsubscribe(client.Symbol)
				delete(h.bySymbol, client.Symbol)
			}
			h.mu.Unlock()
		}
	}
}

func (h *Hub) readFinnhub() {
	for {
		_, msg, err := h.finnhub.ReadMessage()
		if err != nil {
			log.Println("Finnhub read error:", err)
			return
		}

		var payload struct {
			Data []struct {
				Symbol string `json:"s"`
			} `json:"data"`
		}

		if err := json.Unmarshal(msg, &payload); err != nil || len(payload.Data) == 0 {
			continue
		}

		symbol := payload.Data[0].Symbol

		h.mu.Lock()
		for client := range h.bySymbol[symbol] {
			client.Conn.WriteMessage(websocket.TextMessage, msg)
		}
		h.mu.Unlock()
	}
}

func (h *Hub) subscribe(symbol string) {
	msg := fmt.Sprintf(`{"type":"subscribe","symbol":"%s"}`, symbol)
	h.finnhub.WriteMessage(gws.TextMessage, []byte(msg))
}

func (h *Hub) unsubscribe(symbol string) {
	msg := fmt.Sprintf(`{"type":"unsubscribe","symbol":"%s"}`, symbol)
	h.finnhub.WriteMessage(gws.TextMessage, []byte(msg))
}

func StockWSHandler(hub *Hub) func(*websocket.Conn) {
	return func(c *websocket.Conn) {
		symbol := c.Params("symbol")

		client := &Client{
			Conn:   c,
			Symbol: strings.ToUpper(symbol),
		}

		hub.register <- client

		defer func() {
			hub.unregister <- client
			c.Close()
		}()

		// Keep connection alive
		for {
			if _, _, err := c.ReadMessage(); err != nil {
				break
			}
		}
	}
}
