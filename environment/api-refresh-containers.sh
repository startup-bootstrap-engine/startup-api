#!/bin/bash

# Set the service names
API_SERVICE_NAME="swarm-stack_rpg-api"
PATHFINDER_SERVICE_NAME="swarm-stack_rpg-pathfinder"
NPC_SERVICE_NAME="swarm-stack_rpg-npc"

# Additional deployment steps
cd ~/definya/api

# Export database
echo "🐳 Exporting database..."
npm run db:export:swarm

# Update the rpg-pathfinder service to restart containers
echo "🐳 Restarting rpg-pathfinder swarm service..."
docker service update --force --image definya/definya-team:rpg-pathfinder-latest --with-registry-auth --stop-grace-period=10s $PATHFINDER_SERVICE_NAME

# Update the rpg-api service to restart containers
echo "🐳 Restarting rpg-api swarm service..."
docker service update --force --image definya/definya-team:api-latest --with-registry-auth --stop-grace-period=10s $API_SERVICE_NAME

# Update the rpg-npc service to restart containers (using the same image as rpg-api)
echo "🐳 Restarting rpg-npc swarm service..."
docker service update --force --image definya/definya-team:api-latest --with-registry-auth --stop-grace-period=10s $NPC_SERVICE_NAME

echo "🐳 Deployment complete."
