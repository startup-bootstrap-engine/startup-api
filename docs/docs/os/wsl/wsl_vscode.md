# WSL x VSCode

This guide will walk you through setting up **Visual Studio Code (VS Code)** to work seamlessly with **Windows Subsystem for Linux (WSL)**. We'll assume you already have **WSL** installed on your machine.

## Step 1: Install the VS Code WSL Extension

1. Open **VS Code** on your Windows machine.
2. In the **Extensions** view (`Ctrl + Shift + X`), search for "**Remote - WSL**" and click on **Install**.

   The Remote - WSL extension allows you to open a folder in WSL and work on your projects using Linux tools and libraries directly from within VS Code.

## Step 2: Open a WSL Folder in VS Code

1. Open **WSL** on your machine. You can do this by:
   - Pressing `Win + R`, typing `wsl`, and hitting Enter.
   - Or, using your preferred terminal (like **Windows Terminal** or **PowerShell**), type `wsl` and press Enter.
2. In your WSL terminal, navigate to the directory where your project is located or create a new directory if needed:

   ```bash
   cd /path/to/your/project
   ```

3. Once you're in the directory, type the following command to launch VS Code from within WSL:

   ```bash
   code .
   ```

   The `.` tells VS Code to open the current directory. This command will launch VS Code with the WSL extension, enabling Linux functionality.

## Step 3: Configure Default Terminal to WSL

1. In **VS Code**, press `Ctrl + ,` to open **Settings**.
2. In the search bar, type `"terminal.integrated.shell.windows"`.
3. Set the value to:

   ```json
   wsl
   ```

   This ensures that the integrated terminal in VS Code will always use WSL as the default shell.

Alternatively, you can use **Command Palette** (`Ctrl + Shift + P`), type "**Terminal: Select Default Profile**," and choose **WSL** as the default terminal.

## Step 4: Install VS Code Server in WSL

When you open a folder in WSL, **VS Code** will automatically install the **VS Code Server** in WSL. This server acts as the backend for running your VS Code instance directly within WSL.

If prompted, allow the server installation by clicking **Install** when VS Code starts.

## Step 5: Install Extensions for WSL

Extensions that you install on VS Code running in WSL will automatically be installed in the WSL environment rather than on your Windows machine.

1. Open the **Extensions** view (`Ctrl + Shift + X`).
2. Any extension that you install from within a WSL session will be installed in WSL. This includes linters, debuggers, and other development tools.

If you want to install an extension specifically in WSL (and not on Windows), make sure you're in a WSL session before installing it.

## Step 6: Adjusting File Permissions (Optional)

Sometimes, there might be file permission issues when editing files in WSL from VS Code. To ensure proper permissions, you can set the correct file ownership and permissions inside WSL:

```bash
sudo chown -R $(whoami) /path/to/your/project
```

This makes sure that you have full control over your project files.

## Step 7: Start Coding

Now you are ready to code using VS Code within the WSL environment. You can leverage WSL to run Linux-based tools, libraries, and commands directly from within VS Code.

To start the development workflow:

- Open your project in WSL using the `code .` command.
- Use the integrated terminal, where you can access WSL directly.
- Install necessary dependencies using Linux-based package managers (like `apt`, `yarn`, or `npm`).

## Troubleshooting

- **WSL is not detected in VS Code**: Ensure WSL is properly installed and added to your `PATH`. Try restarting your terminal or VS Code if it doesn't recognize WSL.
- **Performance issues**: If VS Code is slow when interacting with WSL, try storing your project files inside the WSL filesystem (`/home/username/project`) rather than the Windows filesystem (`/mnt/c/project`).

That's it! You're all set to develop in a Linux environment using WSL with the power of VS Code.
