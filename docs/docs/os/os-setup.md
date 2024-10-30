---
sidebar_position: 0
---

# OS Setup

## Setup Some Required Tools

Make sure you have installed the following on your machine:

### WSL

If you're on Windows, please follow the [WSL setup](./wsl/wsl.md) to proceed. This will be required together with Docker to run the project.

### Docker & Docker-compose

- **Linux:**
  - [Install Docker on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04)
  - [Install Docker Compose on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)
  - [Docker Post-Install](https://docs.docker.com/engine/install/linux-postinstall/)

### Docker-Desktop

If you're on Windows or Mac, please install Docker Desktop to proceed.

- **Windows**:
  - [Install Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
- **Mac**:
  - [Install Docker Desktop](https://docs.docker.com/desktop/install/mac-install/)

#### Basic Docker Commands

- **Launch Docker Image:**

  ```bash
  docker-compose up
  ```

- **Remove Data, Logs, and Fetches:**
  ```bash
  docker-compose down -v
  ```

#### Running Docker in Project

After installing Docker on your system, please run the following in the project’s root path (make sure you already ran `yarn configure` first):

```bash
docker-compose up
```

- If your setup was done correctly, your containers should start building.
- If you did some mistake and need to start again, please run:
  ```bash
  docker-compose down -v
  docker-compose up
  ```
  _Note: After docker-compose down -v, all your local DB data will be lost._

## Automated OS Setup

To finish your OS setup, please follow through [this section](./automated-os-setup.md) (optional, but recommended)
