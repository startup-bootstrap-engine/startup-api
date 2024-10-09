#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Variables
PROJECT_ID="high-extension-135620"
CONFIG_FILE="./secrets.list"



# IMPORTANT: Secrets should be listed on ./secrets.list
# Format: secret_name output_file_path
#firebase-project-service-account-key ./keys/firebase-admin-keyfile.json
# Add more secrets as needed

# Function to check if gcloud is installed
check_gcloud_installed() {
    if ! command -v gcloud &> /dev/null; then
        echo "Error: gcloud is not installed. Please install the Google Cloud SDK first."
        exit 1
    fi
}

# Function to check if the user is authenticated
check_gcloud_authenticated() {
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "."; then
        echo "Error: No active gcloud authentication found. Please run 'gcloud auth login'."
        exit 1
    fi
}

# Function to check if the project is set correctly
check_project_set() {
    CURRENT_PROJECT=$(gcloud config get-value project)
    if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
        echo "Setting gcloud project to $PROJECT_ID..."
        gcloud config set project "$PROJECT_ID"
    else
        echo "gcloud project is already set to $PROJECT_ID."
    fi
}

# Function to fetch a single secret and generate the file
fetch_secret() {
    local secret_name="$1"
    local output_path="$2"

    echo "Fetching secret '$secret_name' from Secret Manager..."

    # Fetch the latest version of the secret
    SECRET_VALUE=$(gcloud secrets versions access latest --secret="$secret_name" 2>/dev/null)

    if [ -z "$SECRET_VALUE" ]; then
        echo "Error: Secret '$secret_name' not found or is empty."
        exit 1
    fi

    echo "Secret '$secret_name' fetched successfully."

    # Create the output directory if it doesn't exist
    OUTPUT_DIR=$(dirname "$output_path")
    mkdir -p "$OUTPUT_DIR"

    # Write the secret to the output file
    echo "$SECRET_VALUE" > "$output_path"

    echo "Secret written to '$output_path'."
}

# Function to read the configuration file and fetch all secrets
fetch_all_secrets() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "Error: Configuration file '$CONFIG_FILE' not found."
        exit 1
    fi

    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        [[ "$line" =~ ^#.*$ ]] && continue
        [[ -z "$line" ]] && continue

        # Read secret name and output path
        SECRET_NAME=$(echo "$line" | awk '{print $1}')
        OUTPUT_PATH=$(echo "$line" | awk '{print $2}')

        if [ -z "$SECRET_NAME" ] || [ -z "$OUTPUT_PATH" ]; then
            echo "Warning: Invalid line in config: '$line'. Skipping."
            continue
        fi

        fetch_secret "$SECRET_NAME" "$OUTPUT_PATH"
    done < "$CONFIG_FILE"
}

# Main script execution
main() {
    check_gcloud_installed
    check_gcloud_authenticated
    check_project_set
    fetch_all_secrets
    echo "All secrets have been fetched and files generated successfully."
}

# Run the main function
main
