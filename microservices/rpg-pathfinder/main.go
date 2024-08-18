package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

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

func pathHandler(w http.ResponseWriter, r *http.Request) {
	responseChan := make(chan PathResponse)

	var req PathRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	go func() {
		// Perform the pathfinding
		path, err := BreadthFirstFinder(req.StartX, req.StartY, req.EndX, req.EndY, req.Grid)
		if err != nil {
			responseChan <- PathResponse{Error: err.Error()}
			return
		}
		responseChan <- PathResponse{Path: path}
	}()

	// Wait for the response from the goroutine
	resp := <-responseChan

	// Respond to the client
	w.Header().Set("Content-Type", "application/json")
	if resp.Error != "" {
		w.WriteHeader(http.StatusNotFound)
	}
	json.NewEncoder(w).Encode(resp)
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(HealthCheckResponse{Status: "OK"})
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
