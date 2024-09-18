#!/bin/bash

# ! This script is useful to run system cleanup on all Docker Swarm nodes.
# ! It will safely remove unused images, containers, and networks without touching volumes.
# ! Remember that to access the nodes, you must have your SSH keys on their authorized_keys file.

# API NODES (api, pathfinder, etc)

# Load the list of servers for API nodes
servers=($(<swarm-api-nodes.txt))

# Command to clean up Docker on each server without removing volumes
cleanup_command="docker system prune -a -f"

# Loop through each server and run the cleanup command
for server in "${servers[@]}"; do
    echo "Running system prune on $server (safe for volumes)..."
    ssh "$server" "$cleanup_command"
    if [ $? -eq 0 ]; then
        echo "Cleanup executed successfully on $server."
    else
        echo "Failed to execute cleanup on $server."
    fi
done

# ACCESSORY NODES

# Load the server from swarm-accessory-nodes.txt (assuming only one server is listed)
server=$(<swarm-accessory-nodes.txt)

# Run cleanup command on accessory node server
echo "Running system prune on $server (safe for volumes)..."
ssh "$server" "$cleanup_command"
if [ $? -eq 0 ]; then
    echo "Cleanup executed successfully on $server."
    else
    echo "Failed to execute cleanup on $server."
fi
