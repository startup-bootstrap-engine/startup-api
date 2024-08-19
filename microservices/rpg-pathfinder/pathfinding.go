package main

import (
	"errors"
	"fmt"
	"time"
)

type Node struct {
	X        int  `json:"x"`
	Y        int  `json:"y"`
	Walkable bool `json:"walkable"`
}

type Grid struct {
	Width  int      `json:"width"`
	Height int      `json:"height"`
	Nodes  [][]Node `json:"nodes"`
}

func isValidNode(x, y int, grid Grid) bool {
	return x >= 0 && y >= 0 && x < grid.Width && y < grid.Height
}

type Point struct {
	X, Y int
}

func BreadthFirstFinder(startX, startY, endX, endY int, grid Grid) ([][]int, error) {
	startTime := time.Now() // Start timer

	// Validate grid dimensions
	if len(grid.Nodes) == 0 || len(grid.Nodes[0]) == 0 {
		return nil, errors.New("grid is not properly initialized")
	}

	// Validate start and end nodes
	if !isValidNode(startX, startY, grid) || !isValidNode(endX, endY, grid) {
		return nil, errors.New("invalid start or end node")
	}

	// Check if start and end nodes are walkable
	if !grid.Nodes[startY][startX].Walkable || !grid.Nodes[endY][endX].Walkable {
		return [][]int{}, nil // No path if start or end is not walkable
	}

	// Directions for moving: right, down, left, up
	directions := []Node{{X: 1, Y: 0}, {X: 0, Y: 1}, {X: -1, Y: 0}, {X: 0, Y: -1}}

	// Initialize queue and visited map
	queue := []Point{{X: startX, Y: startY}}
	visited := make(map[Point]bool)
	visited[Point{X: startX, Y: startY}] = true

	// To track the path
	parent := make(map[Point]Point)

	// BFS Loop
	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		// Check if we've reached the end
		if current.X == endX && current.Y == endY {
			// Reconstruct the path
			path := [][]int{}
			for current != (Point{X: startX, Y: startY}) {
				path = append([][]int{{current.X, current.Y}}, path...)
				current = parent[current]
			}
			path = append([][]int{{startX, startY}}, path...)
			endTime := time.Now()                                                        // End timer
			fmt.Printf("Execution time: %v ms\n", endTime.Sub(startTime).Milliseconds()) // Log the execution time
			return path, nil
		}

		// Explore neighbors
		for _, dir := range directions {
			newX, newY := current.X+dir.X, current.Y+dir.Y
			newPoint := Point{X: newX, Y: newY}

			if isValidNode(newX, newY, grid) && grid.Nodes[newY][newX].Walkable && !visited[newPoint] {
				queue = append(queue, newPoint)
				visited[newPoint] = true
				parent[newPoint] = current
			}
		}
	}

	endTime := time.Now()                                                        // End timer
	fmt.Printf("Execution time: %v ms\n", endTime.Sub(startTime).Milliseconds()) // Log the execution time
	return [][]int{}, nil                                                        // Return empty path if no path is found
}
