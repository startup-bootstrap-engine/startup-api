#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# avoid npm not found error
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Set the deployment directory
DEPLOY_DIR="/home/jonit/definya/api"

# Set the branch you want to deploy
BRANCH="release"

while read oldrev newrev refname; do
    branch=$(git rev-parse --symbolic --abbrev-ref $refname)
    if [ "$branch" != "$BRANCH" ]; then
        echo "Push to branch $branch ignored"
        exit 0
    fi
done



# Deploy the project!

echo "Refreshing source code..."
GIT_WORK_TREE=$DEPLOY_DIR git checkout -f

cd ~/definya/api

# Source the .env file
set -a
source .env
set +a

# Build based on production Dockerfile
cp ./environment/Dockerfile.prod ./Dockerfile    

# Build and push startup-api Docker image
echo "🐳 Building and pushing startup-api Docker image..."
docker build -t startup-engine/team:api-latest .
docker push startup-engine/team:api-latest


cp ~/definya/api/microservices/startup-pathfinder/environment/Dockerfile.prod ~/definya/api/microservices/startup-pathfinder/Dockerfile

# Build and push startup-pathfinder Docker image
echo "🐳 Building and pushing startup-pathfinder Docker image..."
cd ~/definya/api/microservices/startup-pathfinder

docker build -t startup-engine/team:startup-pathfinder-latest .
docker push startup-engine/team:startup-pathfinder-latest

# Update the Docker Swarm stack
echo "🐳 Updating swarm..."
bash ~/definya/api/environment/api-refresh-containers.sh
