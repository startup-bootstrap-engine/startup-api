#!/bin/bash

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
# Build and push rpg-api Docker image
echo "🐳 Building and pushing rpg-api Docker image..."
docker build -t definya/definya-team:api-latest .
docker push definya/definya-team:api-latest

# Build and push rpg-pathfinder Docker image
echo "🐳 Building and pushing rpg-pathfinder Docker image..."
cd ~/definya/api/microservices/rpg-pathfinder

# Build based on production Dockerfile
cp ./environment/Dockerfile.prod ./Dockerfile

docker build -t definya/definya-team:rpg-pathfinder-latest .
docker push definya/definya-team:rpg-pathfinder-latest


# Update the Docker Swarm stack
echo "🐳 Updating swarm..."
bash ~/definya/api/environment/api-refresh-containers.sh
