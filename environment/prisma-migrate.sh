#!/bin/bash

# Source the environment variables loader
source "$(dirname "$0")/env-load.sh"

# Check if port 5432 is in use by a Docker container
if docker ps --filter "expose=$POSTGRES_PORT" | grep -q "$POSTGRES_PORT/tcp"; then
  echo "✅ Docker container with PostgreSQL is running on port $POSTGRES_PORT."

  # Check for the argument
  if [ "$#" -ne 1 ]; then
    echo "❌ Error: Please provide an environment argument (dev or prod)."
    echo "Usage: $0 [dev|prod]"
    exit 1
  fi

  # Run the appropriate migration command based on the argument
  case "$1" in
    dev)
      echo "Running development migrations..."
      docker-compose exec $API_CONTAINER npx prisma migrate dev
      ;;
    prod)
      echo "Running production migrations..."
      docker-compose exec $API_CONTAINER npx prisma migrate deploy
      ;;
    *)
      echo "❌ Error: Invalid argument. Please use 'dev' or 'prod'."
      echo "Usage: $0 [dev|prod]"
      exit 1
      ;;
  esac
else
  echo "❌ No Docker container is running on port $POSTGRES_PORT. Please start the PostgreSQL container and try again."
  exit 1
fi
