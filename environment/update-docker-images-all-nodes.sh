#!/bin/bash

# ! This script is useful to pull the latest images on all Docker Swarm nodes.
# ! Remember that to access the nodes, you must have your SSH keys on their authorized_keys file.
  
# API NODES (api, pathfinder, etc)

# Load the list of servers
servers=($(<swarm-api-nodes.txt))

# Command to run on each server
command="docker pull definya/definya-team:rpg-pathfinder-latest && docker pull definya/definya-team:api-latest"

# Loop through each server and run the command
for server in "${servers[@]}"; do
    echo "Running command on $server..."
    ssh "$server" "$command"
    if [ $? -eq 0 ]; then
        echo "Command executed successfully on $server."
    else
        echo "Failed to execute command on $server."
    fi
done

 
# ACCESSORY NODES

# Load the server from swarm-accessory-nodes.txt (assuming only one server is listed)
server=$(<swarm-accessory-nodes.txt)

# Commands to run on the server
commands=(
    "docker pull definya/definya-team:docs-latest"
    "docker pull definya/definya-team:client-latest"
)

# Loop through each command and run it on the server
for command in "${commands[@]}"; do
    echo "Running command on $server: $command"
    ssh "$server" "$command"
    if [ $? -eq 0 ]; then
        echo "Command executed successfully on $server."
    else
        echo "Failed to execute command on $server."
    fi
done
