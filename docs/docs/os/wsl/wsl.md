# WSL Setup

The Windows Subsystem for Linux (WSL) allows you to run a GNU/Linux environment directly on Windows, unmodified, without the overhead of a traditional virtual machine or dual-boot setup. This guide will walk you through the steps to install WSL on your Windows machine, leveraging the latest features of WSL 2 for enhanced performance and compatibility.

---

## Prerequisites

Before installing WSL, ensure that your system meets the following requirements:

- **Operating System**: Windows 10 (version 2004 and higher) or Windows 11.
- **System Architecture**: 64-bit.
- **Virtualization**: Enabled in BIOS/UEFI settings.

> **Note**: Most modern systems have virtualization enabled by default. If unsure, you can check in the Task Manager under the "Performance" tab.

## Step 1: Enable WSL and Virtual Machine Platform

Windows 10 and 11 provide a simple way to enable WSL through PowerShell. Follow these steps:

1. **Open PowerShell as Administrator**:

   - Press `Win + X` and select **Windows Terminal (Admin)** or **PowerShell (Admin)** from the menu.

2. **Run the Installation Command**:
   Execute the following command to enable both WSL and the Virtual Machine Platform, which is required for WSL 2:

   ```powershell
   wsl --install
   ```

   > **Note**: This command installs WSL with the default settings, including WSL 2 and the latest Ubuntu distribution.

3. **Restart Your Computer**:
   After the command completes, you will be prompted to restart your computer. Save any work and reboot to apply the changes.

   Alternatively, if you encounter issues, you can manually enable the features:

   ```powershell
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```

   Then restart your computer.

## Step 2: Install a Linux Distribution

After enabling WSL, you need to install a Linux distribution of your choice. The Microsoft Store offers a variety of distributions.

1. **Open Microsoft Store**:

   - Press `Win` and type **Microsoft Store**, then press `Enter` to open it.

2. **Search for Linux Distributions**:

   - In the Store's search bar, type **Linux** or the name of a specific distribution (e.g., **Ubuntu**, **Debian**, **Kali Linux**, **Fedora Remix**).

3. **Choose and Install a Distribution**:

   - Select your preferred distribution from the search results.
   - Click **Get** or **Install** to download and install the distribution.

   > **Popular Choices**:

   - **Ubuntu**: User-friendly and widely supported.
   - **Debian**: Stable and reliable.
   - **Kali Linux**: Focused on security and penetration testing.
   - **openSUSE**: Suitable for developers.

4. **Launch the Distribution**:
   - After installation, click **Launch** from the Store, or find the distribution in the Start menu and open it.

## Step 3: Set WSL 2 as the Default Version

To ensure you're using WSL 2, set it as the default version.

1. **Open PowerShell as Administrator**:

   - Press `Win + X` and select **Windows Terminal (Admin)** or **PowerShell (Admin)**.

2. **Set WSL 2 as Default**:

   - Execute the following command:

     ```powershell
     wsl --set-default-version 2
     ```

   > **Explanation**: This command ensures that any new Linux distributions you install will use WSL 2 by default, providing better performance and full system call compatibility.

3. **Verify the Default Version**:

   - You can check the default WSL version with:

     ```powershell
     wsl --list --verbose
     ```

## Step 4: Initialize Your Linux Distribution

After launching your Linux distribution for the first time, you'll need to complete the initial setup.

1. **Set Up User Account**:

   - Upon first launch, you'll be prompted to create a UNIX username and password. This account is separate from your Windows account.

2. **Update Package Lists**:

   - It's good practice to update your package lists to ensure you have the latest information.

     ```bash
     sudo apt update
     sudo apt upgrade -y
     ```

   > **Note**: Commands may vary depending on the distribution. The above commands are for Debian-based distributions like Ubuntu.

## Step 5: Optional - Update WSL to the Latest Version

To access the latest features and improvements, ensure that WSL is updated.

1. **Download the Latest WSL Installer**:

   - Visit the [WSL official documentation](https://docs.microsoft.com/en-us/windows/wsl/install) to download the latest installer.

2. **Run the Installer**:

   - Execute the downloaded file and follow the on-screen instructions to update WSL.

3. **Verify WSL Version**:

   - In PowerShell, run:

     ```powershell
     wsl --version
     ```

   - Ensure it reflects the latest version.

## Step 6: Configure WSL Settings (Optional)

You can customize WSL behavior by creating a `.wslconfig` file in your Windows user directory.

1. **Create `.wslconfig`**:

   - Open Notepad or your preferred text editor.
   - Add configurations as needed. For example:

     ```ini
     [wsl2]
     memory=4GB   # Limits VM memory
     processors=2 # Limits number of processors
     ```

2. **Save the File**:

   - Save it as `.wslconfig` in `C:\Users\<YourUsername>\`.

3. **Restart WSL**:

   - In PowerShell, run:

     ```powershell
     wsl --shutdown
     ```

   - Then restart your Linux distribution.

## Step 7: Accessing Files Between Windows and Linux

WSL provides seamless integration between Windows and Linux file systems.

- **Access Windows Files from Linux**:

  - Located under `/mnt/c/` for the C: drive, `/mnt/d/` for the D: drive, etc.

    ```bash
    cd /mnt/c/Users/<YourUsername>/Documents
    ```

- **Access Linux Files from Windows**:

  - Navigate to `\\wsl$\<DistroName>\` in File Explorer.

    ```plaintext
    \\wsl$\Ubuntu\
    ```

## Step 8: Integrate VSCode with WSL

Please follow the instructions from [this section](./wsl_vscode.md) to integrate VSCode with WSL.

## Troubleshooting

If you encounter issues during installation or usage, consider the following solutions:

1. **Ensure Virtualization is Enabled**:

   - Restart your computer and enter BIOS/UEFI settings.
   - Ensure that virtualization features (Intel VT-x or AMD-V) are enabled.

2. **Check Windows Version**:

   - WSL 2 requires Windows 10 version 2004 or higher.
   - Press `Win + R`, type `winver`, and press `Enter` to check your version.

3. **Reset or Reinstall the Linux Distribution**:

   - If the distribution isn't working correctly, you can reset it via **Settings > Apps > Apps & features**.

4. **Review Logs and Error Messages**:

   - Run PowerShell commands with `--verbose` for more detailed output.

5. **Consult Official Documentation and Support**:
   - Visit the [WSL Troubleshooting Guide](https://docs.microsoft.com/en-us/windows/wsl/troubleshooting) for more help.

## Additional Resources

- **Official WSL Documentation**: [https://docs.microsoft.com/en-us/windows/wsl/](https://docs.microsoft.com/en-us/windows/wsl/)
- **WSL GitHub Repository**: [https://github.com/microsoft/WSL](https://github.com/microsoft/WSL)
- **Community Forums and Support**:
  - [Stack Overflow WSL Tag](https://stackoverflow.com/questions/tagged/wsl)
  - [Reddit r/bashonubuntuonwindows](https://www.reddit.com/r/bashonubuntuonwindows/)
