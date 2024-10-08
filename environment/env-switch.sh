#!/bin/bash

case $1 in
"dev")
  echo "Generating Development environment .env files"
  cp -fr ./environment/dev.env .env
  cp -fr ./environment/Dockerfile.dev Dockerfile
  yarn module:build
  ;;

"prod")
  echo "Generating Production environment .env files"
  cp -fr ./environment/prod.env .env
  cp -fr ./environment/docker-compose.prod.yml docker-compose.yml
  cp -fr ./environment/Dockerfile.prod Dockerfile
  ;;

"prod:test")
  echo "Generating Production WSL environment .env files"
  cp -fr ./environment/prod.env .env
  cp -fr ./environment/docker-compose.test.yml docker-compose.yml
  cp -fr ./environment/Dockerfile.prod Dockerfile
  ;;

"debug")
  echo "Generating Debug WSL environment .env files"
  cp -fr ./environment/dev.env .env
  cp -fr ./environment/docker-compose.dev.yml docker-compose.yml
  cp -fr ./environment/Dockerfile.debug Dockerfile
  ;;

*)
  echo "Invalid environment option. Please provide 'dev', 'prod', 'prod:test', or 'debug'."
  exit 1
  ;;
esac

echo "✅ Done! Note that you should run 'docker-compose build rpg-api' to rebuild your container with the new changes applied."

echo "
⚠️ WARNING: Make sure you change your CLIENT environment to match your API environment, otherwise it won't work!"
