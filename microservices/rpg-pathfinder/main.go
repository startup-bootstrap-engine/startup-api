package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	jsoniter "github.com/json-iterator/go"
	"github.com/streadway/amqp"
)

var json = jsoniter.ConfigCompatibleWithStandardLibrary

type PathRequest struct {
	StartX int  `json:"startX"`
	StartY int  `json:"startY"`
	EndX   int  `json:"endX"`
	EndY   int  `json:"endY"`
	Grid   Grid `json:"grid"`
}

type PathResponse struct {
	Path  [][]int `json:"path"`
	Error string  `json:"error,omitempty"`
}

type HealthCheckResponse struct {
	Status string `json:"status"`
}

const workerPoolSize = 1000

var pathRequestChan = make(chan PathRequest, workerPoolSize)
var pathResponseChan = make(chan PathResponse, workerPoolSize)

func init() {
	for i := 0; i < workerPoolSize; i++ {
		go worker()
	}
}

func worker() {
	for req := range pathRequestChan {
		path, err := BreadthFirstFinder(req.StartX, req.StartY, req.EndX, req.EndY, req.Grid)
		if err != nil {
			pathResponseChan <- PathResponse{Error: err.Error()}
		} else {
			pathResponseChan <- PathResponse{Path: path}
		}
	}
}

func pathHandler(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	var req PathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	pathfinderStartTime := time.Now()
	select {
	case pathRequestChan <- req:
		select {
		case <-ctx.Done():
			http.Error(w, "Request timed out", http.StatusGatewayTimeout)
		case resp := <-pathResponseChan:
			pathfinderDuration := time.Since(pathfinderStartTime)
			w.Header().Set("Content-Type", "application/json")
			if resp.Error != "" {
				w.WriteHeader(http.StatusNotFound)
			}
			json.NewEncoder(w).Encode(resp)
			totalDuration := time.Since(startTime)
			log.Printf("Total: %s, Pathfinder: %s", totalDuration, pathfinderDuration)
		}
	case <-ctx.Done():
		http.Error(w, "Request timed out", http.StatusGatewayTimeout)
	}

}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(HealthCheckResponse{Status: "OK"})
}

func main() {
	// Start HTTP server in a goroutine
	go startHTTPServer()

	// Set up RabbitMQ connection
	rabbitMQHost := os.Getenv("RABBITMQ_HOST")
	rabbitMQPort := os.Getenv("RABBITMQ_PORT")
	rabbitMQUser := os.Getenv("RABBITMQ_DEFAULT_USER")
	rabbitMQPass := os.Getenv("RABBITMQ_DEFAULT_PASS")

	rabbitMQURL := fmt.Sprintf("amqp://%s:%s@%s:%s/", rabbitMQUser, rabbitMQPass, rabbitMQHost, rabbitMQPort)
	conn, err := amqp.Dial(rabbitMQURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %s", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %s", err)
	}
	defer ch.Close()

	err = ch.ExchangeDeclare(
		"rpg_microservices", // name
		"topic",             // type
		true,                // durable
		false,               // auto-deleted
		false,               // internal
		false,               // no-wait
		nil,                 // arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare an exchange: %s", err)
	}

	q, err := ch.QueueDeclare(
		"rpg_pathfinding_queue", // name
		false,                   // durable
		false,                   // delete when unused
		false,                   // exclusive
		false,                   // no-wait
		nil,                     // arguments
	)
	if err != nil {
		log.Fatalf("Failed to declare a queue: %s", err)
	}

	err = ch.QueueBind(
		q.Name,              // queue name
		"rpg_pathfinding.*", // routing key
		"rpg_microservices", // exchange
		false,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to bind a queue: %s", err)
	}

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		log.Fatalf("Failed to register a consumer: %s", err)
	}

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			if d.RoutingKey == "rpg_pathfinding.find_path" {
				var req PathRequest
				err := json.Unmarshal(d.Body, &req)
				if err != nil {
					log.Printf("Error unmarshaling request: %s", err)
					continue
				}

				path, err := BreadthFirstFinder(req.StartX, req.StartY, req.EndX, req.EndY, req.Grid)
				resp := PathResponse{Path: path}
				if err != nil {
					resp.Error = err.Error()
				}

				respBody, err := json.Marshal(resp)
				if err != nil {
					log.Printf("Error marshaling response: %s", err)
					continue
				}

				err = ch.Publish(
					"rpg_microservices",           // exchange
					"rpg_pathfinding.path_result", // routing key
					false,                         // mandatory
					false,                         // immediate
					amqp.Publishing{
						ContentType: "application/json",
						Body:        respBody,
					})
				if err != nil {
					log.Printf("Error publishing response: %s", err)
				}
			}
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-make(chan bool)
}

func startHTTPServer() {
	http.HandleFunc("/path", pathHandler)
	http.HandleFunc("/health", healthCheckHandler)

	port := ":5004"
	fmt.Printf("Starting server on port %s\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		fmt.Printf("Failed to start server: %s\n", err)
	}
}
