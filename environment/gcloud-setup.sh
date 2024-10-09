#!/bin/bash

# Load .env variable properly in docker swarm environment
export $(cat .env) > /dev/null 2>&1; 

# Function to detect the current shell and set the appropriate profile file
detect_shell_profile() {
    local shell_name
    shell_name=$(basename "$SHELL")

    case "$shell_name" in
        bash)
            echo "$HOME/.bashrc"
            ;;
        zsh)
            echo "$HOME/.zshrc"
            ;;
        fish)
            echo "$HOME/.config/fish/config.fish"
            ;;
        *)
            echo "$HOME/.profile"
            ;;
    esac
}

# Function to add gcloud to PATH in the shell profile
add_gcloud_to_path() {
    local profile_file=$1
    local gcloud_path="$HOME/.gcloud-sdk/google-cloud-sdk/bin"

    # Check if the path is already in the profile
    if ! grep -q "$gcloud_path" "$profile_file"; then
        echo "Adding gcloud to PATH in $profile_file"
        case "$profile_file" in
            *.fish)
                echo "set -gx PATH \$PATH $gcloud_path" >> "$profile_file"
                ;;
            *)
                echo "export PATH=\$PATH:$gcloud_path" >> "$profile_file"
                ;;
        esac
    else
        echo "gcloud path already exists in $profile_file"
    fi
}

# Check if gcloud is already installed
if command -v gcloud &> /dev/null; then
    echo "Google Cloud SDK is already installed."
    gcloud version
else
    echo "Google Cloud SDK not found. Installing..."

    # Define variables
    SDK_VERSION="448.0.0"
    SDK_TAR="google-cloud-sdk-${SDK_VERSION}-linux-x86_64.tar.gz"
    SDK_URL="https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/${SDK_TAR}"
    INSTALL_DIR="$HOME/.gcloud-sdk"

    # Create installation directory
    mkdir -p "$INSTALL_DIR"

    # Download Google Cloud SDK
    echo "Downloading Google Cloud SDK..."
    curl -s -o "$INSTALL_DIR/$SDK_TAR" "$SDK_URL"

    # Extract the SDK
    echo "Extracting Google Cloud SDK..."
    tar -xf "$INSTALL_DIR/$SDK_TAR" -C "$INSTALL_DIR"

    # Install the SDK
    echo "Installing Google Cloud SDK..."
    "$INSTALL_DIR/google-cloud-sdk/install.sh" --quiet

    # Remove the tar file after extraction
    rm "$INSTALL_DIR/$SDK_TAR"

    # Add gcloud to PATH in the current session
    export PATH="$INSTALL_DIR/google-cloud-sdk/bin:$PATH"

    # Detect the shell profile and add gcloud to PATH
    SHELL_PROFILE=$(detect_shell_profile)
    add_gcloud_to_path "$SHELL_PROFILE"

    echo "Google Cloud SDK installation completed."
    echo "Please restart your terminal or run 'source $SHELL_PROFILE' to apply PATH changes."
fi

# Proceed to authenticate
echo "Authenticating Google Cloud SDK..."
gcloud auth application-default login

echo "Setting project to $GOOGLE_CLOUD_PROJECT_ID"
gcloud config set project $GOOGLE_CLOUD_PROJECT_ID


echo "Google Cloud SDK setup and authentication complete."
