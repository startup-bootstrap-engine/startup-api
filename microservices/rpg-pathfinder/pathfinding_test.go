package main

import (
	"errors"
	"fmt"
	"testing"
)

func TestBreadthFirstFinder(t *testing.T) {
	grid := Grid{
		Width:  5,
		Height: 5,
		Nodes: [][]Node{
			{{0, 0, true}, {1, 0, true}, {2, 0, true}, {3, 0, true}, {4, 0, true}},
			{{0, 1, true}, {1, 1, false}, {2, 1, true}, {3, 1, false}, {4, 1, true}},
			{{0, 2, true}, {1, 2, true}, {2, 2, true}, {3, 2, true}, {4, 2, true}},
			{{0, 3, true}, {1, 3, false}, {2, 3, true}, {3, 3, false}, {4, 3, true}},
			{{0, 4, true}, {1, 4, true}, {2, 4, true}, {3, 4, true}, {4, 4, true}},
		},
	}

	tests := []struct {
		startX, startY, endX, endY int
		expectedPath               [][]int
		expectedErr                error
	}{
		// Test case 1: Simple straight path (right then down)
		{0, 0, 4, 4, [][]int{{0, 0}, {1, 0}, {2, 0}, {3, 0}, {4, 0}, {4, 1}, {4, 2}, {4, 3}, {4, 4}}, nil},

		// Test case 2: Path with obstacles (right then down)
		{0, 0, 4, 4, [][]int{{0, 0}, {1, 0}, {2, 0}, {3, 0}, {4, 0}, {4, 1}, {4, 2}, {4, 3}, {4, 4}}, nil},

		// Test case 3: No valid path
		{0, 0, 1, 1, [][]int{}, nil},

		// Test case 4: Start or end node is invalid
		{5, 5, 4, 4, nil, errors.New("invalid start or end node")},
	}

	for _, tt := range tests {
		t.Run(fmt.Sprintf("start(%d,%d)_end(%d,%d)", tt.startX, tt.startY, tt.endX, tt.endY), func(t *testing.T) {
			path, err := BreadthFirstFinder(tt.startX, tt.startY, tt.endX, tt.endY, grid)

			if tt.expectedErr != nil && err == nil {
				t.Errorf("expected error %v, got nil", tt.expectedErr)
			}
			if tt.expectedErr == nil && err != nil {
				t.Errorf("didn't expect error, but got %v", err)
			}

			if !comparePaths(path, tt.expectedPath) {
				t.Errorf("expected path %v, got %v", tt.expectedPath, path)
			}
		})
	}
}

// Helper function to compare paths
func comparePaths(p1, p2 [][]int) bool {
	if len(p1) != len(p2) {
		return false
	}
	for i := range p1 {
		if p1[i][0] != p2[i][0] || p1[i][1] != p2[i][1] {
			return false
		}
	}
	return true
}
