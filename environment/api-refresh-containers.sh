#!/bin/bash

# Set the service names
API_SERVICE_NAME="swarm-stack_startup-api"

# Additional deployment steps
cd ~/definya/api

# Export database
echo "🐳 Exporting database..."
npm run db:export:swarm

# Update the startup-api service to restart containers
echo "🐳 Restarting startup-api swarm service..."
docker service update --force --image startup-engine/team:api-latest --with-registry-auth --stop-grace-period=10s $API_SERVICE_NAME


echo "🐳 Deployment complete."
