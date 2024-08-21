#!/bin/bash

# Load the list of servers  
servers=($(<swarm-api-nodes.txt))

# Command to restart Docker on each server
command="sudo systemctl restart docker"

# Loop through each server and run the command
for server in "${servers[@]}"; do
    echo "Restarting Docker on $server..."
    ssh "$server" "$command"
    if [ $? -eq 0 ]; then
        echo "Docker restarted successfully on $server."
    else
        echo "Failed to restart Docker on $server."
    fi
done
