#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# avoid npm not found error
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Set the deployment directory
DEPLOY_DIR="/home/jonit/definya/client"

# Set the branch you want to deploy
BRANCH="release"

# Get the repository directory
REPO_DIR="/home/jonit/definya/client.git"

while read oldrev newrev refname; do
    branch=$(git rev-parse --symbolic --abbrev-ref $refname)
    if [ "$branch" != "$BRANCH" ]; then
        echo "Push to branch $branch ignored"
        exit 0
    fi
done

# Deploy the project
echo "Deploying project..."
git --work-tree=$DEPLOY_DIR --git-dir=$REPO_DIR checkout -f $BRANCH

# Build React and Docker image
cd ~/definya/client

echo "🐳 Building React..."
npm run build

echo "🐳 Building Docker image..."
docker build -t definya/definya-team:client-latest .
docker push definya/definya-team:client-latest

# Update the service to restart containers and force image update
echo "🐳 Restarting swarm service..."
docker service update --force --image definya/definya-team:client-latest --with-registry-auth swarm-stack_startup-client

docker container prune -f
