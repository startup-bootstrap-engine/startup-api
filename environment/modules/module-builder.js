const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const merge = require("lodash.merge"); // Assuming lodash is already installed

const ENVIRONMENT_PATH = path.join(__dirname, "../");
const MODULES_PATH = path.join(ENVIRONMENT_PATH, "./modules");
const ROOT_PATH = path.join(__dirname, "../../");

// Load environment variables
dotenv.config();

/**
 * Clean specific keys from a configuration object.
 * @param {Object} config - The configuration object (volumes, networks, etc.).
 * @param {Array} keysToRemove - The keys to remove from the config.
 * @returns {Object}
 */
function cleanConfig(config, keysToRemove) {
  if (!config) return config;
  const cleaned = { ...config };
  keysToRemove.forEach((key) => {
    if (cleaned[key]) {
      delete cleaned[key];
    }
  });
  return cleaned;
}

/**
 * Remove empty objects from a configuration section.
 * @param {Object} obj - The object to clean.
 */
function removeEmptyObjects(obj) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object" && obj[key] !== null && Object.keys(obj[key]).length === 0) {
      delete obj[key];
    }
  });
}

/**
 * Remove entire sections if they are empty.
 * @param {Object} compose - The docker-compose configuration object.
 * @param {String} section - The section to check and potentially remove ('volumes' or 'networks').
 */
function removeEmptySection(compose, section) {
  if (compose[section] && Object.keys(compose[section]).length === 0) {
    delete compose[section];
  }
}

/**
 * Build the final docker-compose.yml based on enabled modules.
 */
function buildDockerCompose() {
  const baseComposePath = path.join(MODULES_PATH, "./docker-compose.base.yml");
  const outputComposePath = path.join(ROOT_PATH, "docker-compose.yml");

  // Load base docker-compose.yml
  let baseCompose = yaml.load(fs.readFileSync(baseComposePath, "utf8")) || {};

  // Define available modules and their corresponding file paths
  const modules = {
    rabbitmq: {
      enabled: process.env.MODULE_RABBITMQ === "true",
      composePath: path.join(MODULES_PATH, "./docker-compose.rabbitmq.module.yml"),
      serviceKeys: ["startup-rabbitmq"], // Array to support multiple services per module
      volumeKeys: ["rabbitmq_data"],
      networkKeys: [], // Add if module defines specific networks
    },
    // Example of another module
    // anotherModule: {
    //   enabled: process.env.MODULE_ANOTHER === "true",
    //   composePath: path.join(MODULES_PATH, "./docker-compose.another.module.yml"),
    //   serviceKeys: ["startup-another"],
    //   volumeKeys: ["another_data"],
    //   networkKeys: ["startup-network"], // Shared network
    // },
    // Add more modules here
  };

  // Initialize services, volumes, and networks if not present
  baseCompose.services = baseCompose.services || {};
  baseCompose.volumes = baseCompose.volumes || {};
  baseCompose.networks = baseCompose.networks || {};

  // Arrays to track volumes and networks to remove
  const volumesToRemove = [];
  const networksToRemove = [];

  // Iterate over each module
  Object.keys(modules).forEach((moduleKey) => {
    const module = modules[moduleKey];
    if (module.enabled) {
      console.log(`✅ Enabling module: ${moduleKey}`);
      if (!fs.existsSync(module.composePath)) {
        console.error(`Compose file for module '${moduleKey}' not found at ${module.composePath}`);
        return;
      }

      const moduleCompose = yaml.load(fs.readFileSync(module.composePath, "utf8")) || {};

      // Merge services
      if (moduleCompose.services) {
        baseCompose.services = {
          ...baseCompose.services,
          ...moduleCompose.services,
        };
      }

      // Merge volumes using deep merge
      if (moduleCompose.volumes) {
        baseCompose.volumes = merge(baseCompose.volumes, moduleCompose.volumes);
      }

      // Merge networks using deep merge (if modules define networks)
      if (moduleCompose.networks) {
        baseCompose.networks = merge(baseCompose.networks, moduleCompose.networks);
      }
    } else {
      console.log(`⚠️  Module disabled: ${moduleKey}`);
      // Collect volumes and networks to remove for this disabled module
      if (module.volumeKeys && module.volumeKeys.length > 0) {
        volumesToRemove.push(...module.volumeKeys);
      }
      if (module.networkKeys && module.networkKeys.length > 0) {
        networksToRemove.push(...module.networkKeys);
      }
    }
  });

  // Remove volumes associated with disabled modules
  if (volumesToRemove.length > 0) {
    baseCompose.volumes = cleanConfig(baseCompose.volumes, volumesToRemove);
  }

  // Remove networks associated with disabled modules
  if (networksToRemove.length > 0) {
    baseCompose.networks = cleanConfig(baseCompose.networks, networksToRemove);
  }

  // Optionally, remove services associated with disabled modules
  // (If services are pre-defined in baseCompose.base.yml)
  Object.keys(modules).forEach((moduleKey) => {
    const module = modules[moduleKey];
    if (!module.enabled && module.serviceKeys && module.serviceKeys.length > 0) {
      module.serviceKeys.forEach((serviceKey) => {
        if (baseCompose.services && baseCompose.services[serviceKey]) {
          delete baseCompose.services[serviceKey];
          console.log(`Removed service: ${serviceKey}`);
        }
      });
    }
  });

  // Remove empty objects from 'volumes' and 'networks'
  removeEmptyObjects(baseCompose.volumes);
  removeEmptyObjects(baseCompose.networks);

  // Remove entire 'volumes' or 'networks' sections if they are empty
  removeEmptySection(baseCompose, "volumes");
  removeEmptySection(baseCompose, "networks");

  // Ensure all network entries are objects, not null
  Object.keys(baseCompose.networks).forEach((key) => {
    if (baseCompose.networks[key] === null) {
      baseCompose.networks[key] = {};
    }
  });

  // Ensure all volume entries are objects, not null
  Object.keys(baseCompose.volumes).forEach((key) => {
    if (baseCompose.volumes[key] === null) {
      baseCompose.volumes[key] = {};
    }
  });

  // Convert back to YAML and write to docker-compose.yml
  const finalYaml = yaml.dump(baseCompose, { noRefs: true, indent: 2 });

  fs.writeFileSync(outputComposePath, finalYaml, "utf8");

  console.log("✅ docker-compose.yml has been successfully built.");
}

// Execute the build process
buildDockerCompose();
