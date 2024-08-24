#!/bin/bash

#! This script is useful to refresh DNS issues on Docker Swarm nodes. However, probably you'll need to pull the images again.
# ! Remember that to access the nodes, you must have your SSH keys on their authorized_keys file.


# Load the list of servers from both files
servers=($(<swarm-api-nodes.txt) $(<swarm-accessory-nodes.txt))

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
