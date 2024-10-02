const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
// const { ENVIRONMENT_PATH, ROOT_PATH } = require("../../src/providers/constants/PathConstants");

const ENVIRONMENT_PATH = path.join(__dirname, "../");
const MODULES_PATH = path.join(ENVIRONMENT_PATH, "./modules");
const ROOT_PATH = path.join(__dirname, "../../");

// Load environment variables
dotenv.config();

/**
 * Build the final docker-compose.yml based on enabled modules.
 */
function buildDockerCompose() {
  const baseComposePath = path.join(MODULES_PATH, "./docker-compose.base.yml");
  const outputComposePath = path.join(ROOT_PATH, "docker-compose.yml");

  // Load base docker-compose.yml
  let baseCompose = yaml.load(fs.readFileSync(baseComposePath, "utf8"));

  // Define available modules and their corresponding file paths
  const modules = {
    rabbitmq: {
      enabled: process.env.MODULE_RABBITMQ === "true",
      composePath: path.join(MODULES_PATH, "./docker-compose.rabbitmq.module.yml"),
      serviceKey: "startup-rabbitmq",
      volumeKey: "rabbitmq_data",
    },
    // Add more modules here
  };

  // Initialize services and volumes if not present
  baseCompose.services = baseCompose.services || {};
  baseCompose.volumes = baseCompose.volumes || {};

  // Iterate over each module and merge if enabled
  Object.keys(modules).forEach((moduleKey) => {
    const module = modules[moduleKey];
    if (module.enabled) {
      const moduleCompose = yaml.load(fs.readFileSync(module.composePath, "utf8"));

      // Merge services
      baseCompose.services = {
        ...baseCompose.services,
        ...moduleCompose,
      };

      // Merge volumes
      if (moduleCompose.volumes) {
        baseCompose.volumes = {
          ...baseCompose.volumes,
          ...moduleCompose.volumes,
        };
      }
    }
  });

  // Convert back to YAML and write to docker-compose.yml
  const finalYaml = yaml.dump(baseCompose);
  fs.writeFileSync(outputComposePath, finalYaml, "utf8");
}

// Execute the build process
buildDockerCompose();
