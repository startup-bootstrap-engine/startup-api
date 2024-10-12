#!/bin/bash

# =============================================================================
# Script Name: install_os_dependencies.sh
# Description: Installs necessary OS dependencies, handles libssl installation,
#              checks and installs NVM, and ensures the correct Node.js version.
# =============================================================================

# Define variables
TMP_DIR=~/tmp
DEB_URL="http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb"
DEB_FILE="$TMP_DIR/libssl1.1_1.1.1f-1ubuntu2_amd64.deb"



# Update package list
echo "Updating package list..."
sudo apt-get update

# Install required packages
echo "Installing wget, libssl-dev, cmake, and build-essential..."
sudo apt-get install -y wget libssl-dev cmake build-essential

# Create tmp directory if it doesn't exist
echo "Creating temporary directory at $TMP_DIR..."
mkdir -p "$TMP_DIR"

# Download the .deb file to tmp directory
echo "Downloading libssl1.1 from $DEB_URL..."
wget -P "$TMP_DIR" "$DEB_URL"

# Install the .deb file
echo "Installing libssl1.1 from $DEB_FILE..."
sudo dpkg -i "$DEB_FILE"

# Fix dependencies if dpkg failed
if [ $? -ne 0 ]; then
    echo "Fixing dependencies..."
    sudo apt-get install -f -y
fi

# Clean up the .deb file
echo "Removing the downloaded .deb file..."
rm "$DEB_FILE"

# Function to check if NVM is installed
check_nvm_installed() {
    if command -v nvm >/dev/null 2>&1; then
        return 0
    elif [ -d "$HOME/.nvm" ]; then
        # Source nvm script if nvm directory exists
        export NVM_DIR="$HOME/.nvm"
        # shellcheck source=/dev/null
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        return 0
    else
        return 1
    fi
}

# Check if NVM is installed
if check_nvm_installed; then
    echo "NVM is already installed."
else
    echo "NVM is not installed. Installing NVM..."
    # Install NVM using the official install script
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

    # Source NVM scripts
    export NVM_DIR="$HOME/.nvm"
    # shellcheck source=/dev/null
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    echo "NVM installed successfully."
fi

# Ensure NVM is available
if ! command -v nvm >/dev/null 2>&1; then
    echo "NVM is not available. Please check the installation."
    exit 1
fi

# Check if .nvmrc exists
if [ -f ".nvmrc" ]; then
    EXPECTED_VERSION=$(cat .nvmrc | tr -d 'v')
    echo "Found .nvmrc with Node.js version: v$EXPECTED_VERSION"

    # Get the currently active Node.js version
    CURRENT_VERSION=$(nvm current)
    echo "Current Node.js version: $CURRENT_VERSION"

    # Compare versions
    if [ "$CURRENT_VERSION" = "v$EXPECTED_VERSION" ]; then
        echo "Node.js is already using the correct version: v$EXPECTED_VERSION"
    else
        echo "Node.js version mismatch. Installing v$EXPECTED_VERSION..."
        nvm install "$EXPECTED_VERSION"

        echo "Setting Node.js v$EXPECTED_VERSION as default..."
        nvm alias default "$EXPECTED_VERSION"

        echo "Node.js v$EXPECTED_VERSION installed and set as default."
    fi
else
    echo ".nvmrc file not found. Skipping Node.js version check."
fi

echo "OS Dependencies Installation Completed Successfully!"
