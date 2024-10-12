#!/bin/bash

# ----------------------------
# Configuration
# ----------------------------

# Path to the nodes list file
NODES_FILE="swarm-api-nodes.txt"

# Filename of the master's public key on the master machine
MASTER_PUBLIC_KEY_FILENAME="id_rsa.pub"  # Change if using a different key

# ----------------------------
# Function Definitions
# ----------------------------

# Function to check if the nodes file exists
check_nodes_file() {
    if [[ ! -f "$NODES_FILE" ]]; then
        echo "Error: Nodes file '$NODES_FILE' not found in the current directory."
        exit 1
    fi
}

# Function to load nodes from the file
load_nodes() {
    echo "Loading nodes from '$NODES_FILE'..."
    mapfile -t NODES < "$NODES_FILE"

    if [[ ${#NODES[@]} -lt 2 ]]; then
        echo "Error: The nodes file must contain at least one master node and one child node."
        exit 1
    fi

    MASTER_NODE="${NODES[0]}"
    CHILD_NODES=("${NODES[@]:1}")

    echo "Master Node: $MASTER_NODE"
    echo "Child Nodes: ${#CHILD_NODES[@]}"
}

# Function to retrieve the master's public key and base64 encode it
get_master_public_key() {
    echo "Retrieving master's public SSH key from '$MASTER_NODE'..."
    MASTER_PUBLIC_KEY=$(ssh "$MASTER_NODE" "cat \$HOME/.ssh/${MASTER_PUBLIC_KEY_FILENAME}" 2>/dev/null)

    if [[ -z "$MASTER_PUBLIC_KEY" ]]; then
        echo "Error: Failed to retrieve the master's public key from '$MASTER_NODE'."
        exit 1
    fi

    # Base64 encode the master's public key
    BASE64_MASTER_PUBLIC_KEY=$(echo "$MASTER_PUBLIC_KEY" | base64 -w0)

    echo "Master's public key retrieved and encoded successfully."
}

# Function to append the master's public key to a child node
append_key_to_child() {
    local CHILD="$1"
    echo "Processing ${CHILD}..."

    ssh "$CHILD" "export BASE64_MASTER_PUBLIC_KEY='$BASE64_MASTER_PUBLIC_KEY'; bash -s" <<'ENDSSH'
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Ensure authorized_keys exists
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Backup authorized_keys if backup doesn't already exist
if [[ ! -f ~/.ssh/authorized_keys.bak ]]; then
    cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.bak
fi

# Ensure file ends with a newline
sed -i -e '$a\' ~/.ssh/authorized_keys

# Decode the base64-encoded master public key
MASTER_PUBLIC_KEY=$(echo "$BASE64_MASTER_PUBLIC_KEY" | base64 -d)

# Append the master's public key if it's not already present
grep -qxF "$MASTER_PUBLIC_KEY" ~/.ssh/authorized_keys || echo "$MASTER_PUBLIC_KEY" >> ~/.ssh/authorized_keys
ENDSSH

    if [[ $? -eq 0 ]]; then
        echo "Successfully appended the key to ${CHILD}."
    else
        echo "Error: Failed to append the key to ${CHILD}."
    fi
}

# ----------------------------
# Main Execution
# ----------------------------

# Check if the nodes file exists
check_nodes_file

# Load nodes from the file
load_nodes

# Retrieve the master's public key and base64 encode it
get_master_public_key

# Iterate over each child node and append the key
for CHILD in "${CHILD_NODES[@]}"; do
    append_key_to_child "$CHILD"
done

echo "All operations completed."
