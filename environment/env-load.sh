#!/bin/bash

# Function to sanitize and export environment variables
load_env() {
    local env_file=".env"
    
    # Check if .env file exists
    if [ ! -f "$env_file" ]; then
        echo "❌ Error: .env file not found"
        return 1
    fi

    # Process the .env file line by line
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi

        # Remove leading/trailing whitespace
        line=$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

        # Extract key and value
        if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"

            # Remove quotes from value
            value=$(echo "$value" | sed -e 's/^["\x27]//' -e 's/["\x27]$//')

            # Export the variable
            export "$key=$value"
        fi
    done < "$env_file"

}

# Load the environment variables
load_env
