#!/bin/bash

# Setup gcloud cli
bash ./environment/gcloud-setup.sh

bash ./environment/generate-secret-files.sh

tput setaf 3;  echo "⚙️ Switching env to dev..."
tput setaf 2;
yarn env:switch:dev
