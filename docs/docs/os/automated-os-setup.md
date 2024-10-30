# Automated OS setup

If you're short on time, you can run this script to setup your terminal. It will install Zsh, Oh My Zsh, Powerline fonts, and add some useful aliases.

```bash
#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# ----------------------------
# Variables
# ----------------------------

# URLs
OH_MY_ZSH_URL="https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh"
NVM_INSTALL_URL="https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh"

# Directories
ZSH_CUSTOM="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"
ZSH_AUTOSUGGESTIONS_DIR="$ZSH_CUSTOM/plugins/zsh-autosuggestions"
ZSH_SYNTAX_HIGHLIGHTING_DIR="$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"

# Files
SHELL_CONFIG=$( [ -n "$ZSH_VERSION" ] && echo "$HOME/.zshrc" || echo "$HOME/.bashrc" )
ZSHRC_FILE="$HOME/.zshrc"
SSH_KEY="$HOME/.ssh/id_rsa"

# ----------------------------
# Helper Functions
# ----------------------------

print_message() {
    echo -e "\n========================================"
    echo -e "$1"
    echo -e "========================================\n"
}

install_package_if_missing() {
    PACKAGE=$1
    if ! dpkg -s "$PACKAGE" >/dev/null 2>&1; then
        echo "Installing $PACKAGE..."
        sudo apt-get install -y "$PACKAGE"
    else
        echo "$PACKAGE is already installed."
    fi
}

# ----------------------------
# Step 1: Update System and Install Basic Utilities
# ----------------------------

update_system() {
    print_message "Updating package list and upgrading existing packages..."
    sudo apt-get update
    sudo apt-get upgrade -y
}

install_basic_utilities() {
    print_message "Installing basic utilities..."
    install_package_if_missing "wget"
    install_package_if_missing "curl"
    install_package_if_missing "git"
    install_package_if_missing "unzip"
    install_package_if_missing "build-essential"
    install_package_if_missing "cmake"
    install_package_if_missing "libssl-dev"
    install_package_if_missing "zsh"
    install_package_if_missing "fonts-powerline"
}

# ----------------------------
# Step 2: Install and Configure Zsh with Oh My Zsh
# ----------------------------

install_zsh() {
    print_message "Installing Zsh..."
    install_package_if_missing "zsh"

    if command -v zsh >/dev/null 2>&1; then
        echo "Zsh installed successfully."
    else
        echo "Zsh installation failed."
        exit 1
    fi
}

change_default_shell() {
    print_message "Changing the default shell to Zsh for user $(whoami)..."
    if [ "$(basename "$SHELL")" != "zsh" ]; then
        chsh -s "$(which zsh)"
        echo "Default shell changed to Zsh. Please log out and log back in to apply changes."
    else
        echo "Zsh is already the default shell."
    fi
}

install_oh_my_zsh() {
    if [ ! -d "$HOME/.oh-my-zsh" ]; then
        print_message "Installing Oh My Zsh..."
        RUNZSH=no CHSH=no KEEP_ZSHRC=yes sh -c "$(curl -fsSL $OH_MY_ZSH_URL)"
    else
        echo "Oh My Zsh is already installed."
    fi
}

install_zsh_plugins() {
    # Install zsh-autosuggestions
    if [ ! -d "$ZSH_AUTOSUGGESTIONS_DIR" ]; then
        print_message "Installing zsh-autosuggestions plugin..."
        git clone https://github.com/zsh-users/zsh-autosuggestions "$ZSH_AUTOSUGGESTIONS_DIR"
    else
        echo "zsh-autosuggestions is already installed."
    fi

    # Install zsh-syntax-highlighting
    if [ ! -d "$ZSH_SYNTAX_HIGHLIGHTING_DIR" ]; then
        print_message "Installing zsh-syntax-highlighting plugin..."
        git clone https://github.com/zsh-users/zsh-syntax-highlighting.git "$ZSH_SYNTAX_HIGHLIGHTING_DIR"
    else
        echo "zsh-syntax-highlighting is already installed."
    fi
}

configure_oh_my_zsh() {
    # Backup existing .zshrc if not already backed up
    if [ ! -f "$HOME/.zshrc.pre-oh-my-zsh" ]; then
        cp "$ZSHRC_FILE" "$HOME/.zshrc.pre-oh-my-zsh"
        echo "Backed up the original .zshrc to .zshrc.pre-oh-my-zsh"
    fi

    print_message "Configuring Oh My Zsh plugins in .zshrc..."

    # Ensure plugins line exists and is properly configured
    if grep -q "^plugins=" "$ZSHRC_FILE"; then
        sed -i "s/^plugins=(.*)$/plugins=(git zsh-autosuggestions zsh-syntax-highlighting)/" "$ZSHRC_FILE"
    else
        echo 'plugins=(git zsh-autosuggestions zsh-syntax-highlighting)' >> "$ZSHRC_FILE"
    fi
}

# ----------------------------
# Step 3: Install NVM and Node.js
# ----------------------------

install_nvm() {
    if [ ! -d "$HOME/.nvm" ]; then
        print_message "Installing NVM (Node Version Manager)..."
        curl -o- "$NVM_INSTALL_URL" | bash
    else
        echo "NVM is already installed."
    fi
}

configure_nvm() {
    if ! grep -q 'export NVM_DIR="$HOME/.nvm"' "$ZSHRC_FILE"; then
        print_message "Configuring NVM in .zshrc..."
        {
            echo ""
            echo "# NVM Configuration"
            echo 'export NVM_DIR="$HOME/.nvm"'
            echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm'
            echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion'
        } >> "$ZSHRC_FILE"
    else
        echo "NVM is already configured in .zshrc."
    fi
}

install_node() {
    # Load NVM
    export NVM_DIR="$HOME/.nvm"
    # shellcheck source=/dev/null
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    if ! command -v node >/dev/null 2>&1; then
        print_message "Installing Node.js v18.20.4..."
        nvm install 18.20.4
        nvm use 18.20.4
        nvm alias default 18.20.4

        echo "Node.js $(node -v) and npm $(npm -v) have been installed."
    else
        echo "Node.js is already installed."
    fi
}

# ----------------------------
# Step 4: Configure SSH Keys
# ----------------------------

configure_ssh() {
    print_message "Configuring SSH key..."

    if [ -f "$SSH_KEY" ]; then
        echo "An SSH key already exists at $SSH_KEY."
    else
        read -p "No SSH key found. Would you like to generate one? (y/N): " generate_key
        generate_key=${generate_key:-N}
        if [[ "$generate_key" =~ ^[Yy]$ ]]; then
            ssh-keygen -t rsa -b 4096 -C "$(whoami)@$(hostname)" -f "$SSH_KEY" -N ""
            eval "$(ssh-agent -s)"
            ssh-add "$SSH_KEY"
            echo "SSH key generated and added to the SSH agent."
            echo "Add the following public key to your GitHub/GitLab account:"
            echo "------------------------------------------------------------"
            cat "${SSH_KEY}.pub"
            echo "------------------------------------------------------------"
        else
            echo "Skipping SSH key generation."
        fi
    fi
}

# ----------------------------
# Step 5: Add Custom Aliases and Functions
# ----------------------------

configure_custom_aliases() {
    print_message "Adding custom aliases and functions to $SHELL_CONFIG..."

    # Define aliases and functions
    declare -A aliases=(
        ["dlsapi"]="docker-compose logs -f --tail=100 startup-api"
        ["dcup"]="docker-compose up -d"
        ["dcre"]="docker-compose restart"
        ["dcstop"]="docker-compose stop"
        ["dcb"]="docker-compose build"
        ["dcrm"]="docker-compose rm -f"
        ["dcd"]="docker-compose down"
    )

    # Add aliases if they don't exist
    for alias_name in "${!aliases[@]}"; do
        alias_command="alias $alias_name=\"${aliases[$alias_name]}\""
        if ! grep -q "^alias $alias_name=" "$SHELL_CONFIG"; then
            echo "$alias_command" >> "$SHELL_CONFIG"
            echo "Added alias '$alias_name' to $SHELL_CONFIG."
        else
            echo "Alias '$alias_name' already exists in $SHELL_CONFIG."
        fi
    done

    # Add generic dl function if it doesn't exist
    if ! grep -q '^dl()' "$SHELL_CONFIG"; then
        cat << 'EOF' >> "$SHELL_CONFIG"

# Generic function to view logs of any container
dl() {
    if [ -z "$1" ]; then
        echo "Usage: dl <container_name>"
        return 1
    fi
    docker-compose logs -f --tail=100 "$1"
}
EOF
        echo "Added function 'dl' to $SHELL_CONFIG."
    else
        echo "Function 'dl' already exists in $SHELL_CONFIG."
    fi
}

# ----------------------------
# Step 6: Install Powerline Fonts
# ----------------------------

install_powerline_fonts() {
    print_message "Installing Powerline fonts for better visuals..."
    install_package_if_missing "fonts-powerline"
    echo "Powerline fonts installation complete."
}

# ----------------------------
# Step 7: Finalizing Setup
# ----------------------------

finalize_setup() {
    print_message "Setup complete! Please restart your terminal or run 'exec zsh' to apply the changes."

    echo "To verify:
1. Zsh is set as the default shell.
2. Oh My Zsh is installed.
3. Plugins (zsh-autosuggestions and zsh-syntax-highlighting) are active.
4. NVM is installed and configured.
5. Node.js $(node -v) is installed.

You can now manage Node.js versions using NVM, e.g., 'nvm install <version>'."
}

# ----------------------------
# Main Execution Flow
# ----------------------------

main() {
    update_system
    install_basic_utilities
    install_zsh
    change_default_shell
    install_oh_my_zsh
    install_zsh_plugins
    configure_oh_my_zsh
    install_nvm
    configure_nvm
    install_node
    install_powerline_fonts
    configure_ssh
    configure_custom_aliases
    finalize_setup
}

# Execute main function
main

```

### OS Setup Documentation: Automated Zsh & Node.js Environment Setup Script

#### Overview

This script automates the installation and configuration of a Zsh development environment, setting up essential tools like Oh My Zsh, plugins, NVM (Node Version Manager), and Node.js. Additionally, it enhances terminal usability with helpful aliases, customizations, and Powerline fonts. It is ideal for developers who want to streamline the setup process on a fresh system or enhance their current terminal experience.

#### What It Will Do

1. **System Update & Dependency Installation**:

   - Updates and upgrades system packages.
   - Installs basic dependencies like `libssl-dev`, `cmake`, and `build-essential`.

2. **Zsh Shell Installation & Configuration**:

   - Installs Zsh, switches the default shell to Zsh, and installs [Oh My Zsh](https://ohmyz.sh/), a popular framework for managing Zsh configurations.
   - Installs plugins like:
     - `zsh-autosuggestions`: Provides command suggestions based on your history.
     - `zsh-syntax-highlighting`: Adds syntax highlighting to your commands.

3. **NVM & Node.js Setup**:

   - Installs NVM (Node Version Manager) for managing multiple Node.js versions.
   - Installs the latest stable version of Node.js using NVM.

4. **Powerline Fonts Installation**:

   - Installs Powerline fonts to improve the terminal’s visual appearance.

5. **SSH Key Configuration**:

   - Checks if an SSH key exists and offers to generate a new one if needed, useful for authenticating with GitHub, GitLab, or other services.

6. **Custom Aliases & Functions**:

   - Adds custom aliases for Docker and utility functions for quick access to logs, restarting services, and stopping Docker containers.

7. **Final Configuration**:
   - Customizes your `.zshrc` to enable plugins and configure NVM, ensuring your terminal is ready for development with personalized settings.

#### How to Benefit from It

- **Efficiency**: By automating the setup process, you save time manually configuring your terminal environment. You get a complete development setup in minutes.
- **Improved Development Experience**: Zsh and Oh My Zsh, combined with the plugins, provide a more user-friendly and productive shell experience. You'll benefit from features like autosuggestions, syntax highlighting, and better visuals with Powerline fonts.
- **Node.js Management**: With NVM, you can easily switch between different Node.js versions, essential for projects requiring different environments.
- **SSH Key Setup**: Ensures you can securely interact with Git repositories using SSH.

#### Usage Instructions

1. **Run the Script**:

   - Copy and paste the code above into a new file:

     ```bash
     # create the file
     nano automated_os_setup.sh

     # add executable permissions
     chmod +x automated_os_setup.sh

     # run the script
     ./automated_os_setup.sh
     ```

2. **Restart Your Terminal**:

   - Once the script finishes, restart your terminal or run `exec zsh` to apply the changes.

3. **Verify Installation**:

   - Zsh should now be your default shell.
   - Oh My Zsh is installed, and plugins (zsh-autosuggestions, zsh-syntax-highlighting) are active.
   - Node.js should be installed and managed using NVM.

   You can check Node.js installation with:

   ```bash
   node -v
   npm -v
   ```

#### Post Setup

After running this script, you will have a fully configured terminal environment ready for development. Use the custom aliases added in `.zshrc` for Docker management, and start working efficiently with Zsh and Node.js.

#### Alias Usage

- `dlsapi`: View logs of the `startup-api` container.
- `dcre`: Restart the Docker containers.
- `dcstop`: Stop the Docker containers.
- `dcb`: Build the Docker containers.
