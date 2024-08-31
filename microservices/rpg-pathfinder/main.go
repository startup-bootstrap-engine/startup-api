package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	jsoniter "github.com/json-iterator/go"
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
	http.HandleFunc("/path", pathHandler)
	http.HandleFunc("/health", healthCheckHandler) // Health check endpoint

	port := ":5004"
	fmt.Printf("Starting server on port %s\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		fmt.Printf("Failed to start server: %s\n", err)
	}
}
