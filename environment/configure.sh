#!/bin/bash

tput setaf 3;  echo "⚙️ Switching env to dev..."
tput setaf 2;
cp -fr ./environment/dev.env .env
cp -fr ./environment/Dockerfile.dev Dockerfile


# Setup gcloud cli
bash ./environment/gcloud-setup.sh

bash ./environment/generate-secret-files.sh


