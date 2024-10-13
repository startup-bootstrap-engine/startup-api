#!/bin/bash

# Function to print messages
print_message() {
    echo "=============================="
    echo "$1"
    echo "=============================="
}

# Switch environment to dev
tput setaf 3
echo "⚙️ Switching env to dev..."
tput setaf 2
cp -fr ./environment/dev.env .env
cp -fr ./environment/Dockerfile.dev Dockerfile


# Create dir if not exists
mkdir -p ./environment/keys

# Setup keys folder permissions
chmod +w ./environment/keys

# Install OS dependencies
print_message "Starting OS Dependencies Installation"
bash ./environment/os-dependencies.sh

# Install VSCode extensions
print_message "Starting VSCode Extensions Installation"
bash ./environment/vscode-extensions-setup.sh

# Install gcloud CLI
print_message "Starting gcloud CLI Installation"
bash ./environment/gcloud-setup.sh


# Generate secret files
print_message "Starting Secret Files Generation"
bash ./environment/generate-secret-files.sh
