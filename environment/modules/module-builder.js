const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const merge = require("lodash.merge"); // Assuming lodash is already installed

const {
  cleanConfig,
  removeEmptyObjects,
  removeEmptySection,
  loadYamlFile,
  mergeModuleCompose,
  cleanDependsOn,
} = require("./module-builder-utils");

// Define important paths
const ENVIRONMENT_PATH = path.join(__dirname, "../");
const MODULES_PATH = path.join(ENVIRONMENT_PATH, "modules");
const ROOT_PATH = path.join(__dirname, "../../");

// Load environment variables from .env file
dotenv.config();

/**
 * Defines the modules with their configurations.
 *
 * @returns {Object} - An object containing module configurations.
 */
function getModules() {
  return {
    rabbitmq: {
      enabled: process.env.MODULE_RABBITMQ === "true",
      composePath: path.join(MODULES_PATH, "docker-compose.rabbitmq.module.yml"),
      serviceKeys: ["startup-rabbitmq"],
      volumeKeys: ["rabbitmq_data"],
      networkKeys: [], // Add specific networks if any
    },
    redis: {
      enabled: process.env.MODULE_REDIS === "true",
      composePath: path.join(MODULES_PATH, "docker-compose.redis.module.yml"),
      serviceKeys: ["startup-redis"],
      networkKeys: ["startup-network"], // Shared network
    },
    mongodb: {
      enabled: process.env.MODULE_MONGODB === "true",
      composePath: path.join(MODULES_PATH, "docker-compose.mongodb.module.yml"),
      serviceKeys: ["startup-db"],
      networkKeys: ["startup-network"], // Shared network
    },
    // Add additional modules here
    // anotherModule: {
    //   enabled: process.env.MODULE_ANOTHER === "true",
    //   composePath: path.join(MODULES_PATH, "docker-compose.another.module.yml"),
    //   serviceKeys: ["startup-another"],
    //   volumeKeys: ["another_data"],
    //   networkKeys: ["startup-network"], // Shared network
    // },
  };
}

/**
 * Builds the final docker-compose.yml based on enabled modules.
 */
function buildDockerCompose() {
  const baseComposePath = path.join(MODULES_PATH, "docker-compose.base.yml");
  const outputComposePath = path.join(ROOT_PATH, "docker-compose.yml");

  // Load the base docker-compose.yml
  const baseCompose = loadYamlFile(baseComposePath);

  // Ensure essential sections exist
  baseCompose.services = baseCompose.services || {};
  baseCompose.volumes = baseCompose.volumes || {};
  baseCompose.networks = baseCompose.networks || {};

  const modules = getModules();

  // Arrays to track volumes and networks to remove
  const volumesToRemove = [];
  const networksToRemove = [];

  // Process each module
  Object.entries(modules).forEach(([moduleKey, moduleConfig]) => {
    if (moduleConfig.enabled) {
      console.log(`✅ Enabling module: ${moduleKey}`);

      if (!fs.existsSync(moduleConfig.composePath)) {
        console.error(`Compose file for module '${moduleKey}' not found at ${moduleConfig.composePath}`);
        return;
      }

      const moduleCompose = loadYamlFile(moduleConfig.composePath);
      mergeModuleCompose(baseCompose, moduleCompose);
    } else {
      console.log(`⚠️  Module disabled: ${moduleKey}`);

      // Collect volumes and networks to remove
      if (moduleConfig.volumeKeys?.length) {
        volumesToRemove.push(...moduleConfig.volumeKeys);
      }
      if (moduleConfig.networkKeys?.length) {
        networksToRemove.push(...moduleConfig.networkKeys);
      }
    }
  });

  // Remove unused volumes and networks
  if (volumesToRemove.length) {
    baseCompose.volumes = cleanConfig(baseCompose.volumes, volumesToRemove);
  }

  if (networksToRemove.length) {
    baseCompose.networks = cleanConfig(baseCompose.networks, networksToRemove);
  }

  // Remove services associated with disabled modules
  Object.values(modules).forEach((module) => {
    if (!module.enabled && module.serviceKeys?.length) {
      module.serviceKeys.forEach((serviceKey) => {
        if (baseCompose.services && baseCompose.services[serviceKey]) {
          delete baseCompose.services[serviceKey];
          console.log(`Removed service: ${serviceKey}`);
        }
      });
    }
  });

  // Clean up 'depends_on' references
  cleanDependsOn(baseCompose.services);

  // Remove empty volumes and networks
  removeEmptyObjects(baseCompose.volumes);
  removeEmptyObjects(baseCompose.networks);

  // Remove entire sections if they are empty
  removeEmptySection(baseCompose, "volumes");
  removeEmptySection(baseCompose, "networks");

  // Ensure all entries are objects and not null
  Object.keys(baseCompose).forEach((section) => {
    if (typeof baseCompose[section] === "object" && baseCompose[section] !== null) {
      Object.keys(baseCompose[section]).forEach((key) => {
        if (baseCompose[section][key] === null) {
          baseCompose[section][key] = {};
        }
      });
    }
  });

  // Convert the final configuration back to YAML
  let finalYaml = yaml.dump(baseCompose, { noRefs: true, indent: 2 });

  // Remove empty object representations
  finalYaml = finalYaml.replace(/: {}\n/g, ":\n");

  // Write the final docker-compose.yml
  fs.writeFileSync(outputComposePath, finalYaml, "utf8");

  console.log("✅ docker-compose.yml has been successfully built.");
}

// Execute the build process
buildDockerCompose();