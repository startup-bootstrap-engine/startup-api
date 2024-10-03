const yaml = require("js-yaml");
const fs = require("fs");
const merge = require("lodash.merge");

/**
 * Removes specified keys from a configuration object.
 *
 * @param {Object} config - The configuration object (e.g., volumes, networks).
 * @param {Array<string>} keysToRemove - The keys to remove from the config.
 * @returns {Object} - The cleaned configuration object.
 */
function cleanConfig(config, keysToRemove) {
  if (!config) return config;

  const cleanedConfig = { ...config };
  keysToRemove.forEach((key) => {
    if (cleanedConfig[key]) {
      delete cleanedConfig[key];
    }
  });

  return cleanedConfig;
}

/**
 * Deletes empty objects from a given object.
 *
 * @param {Object} obj - The object to clean.
 */
function removeEmptyObjects(obj) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (typeof value === "object" && value !== null && Object.keys(value).length === 0) {
      delete obj[key];
    }
  });
}

/**
 * Deletes a section from the compose file if it's empty.
 *
 * @param {Object} compose - The docker-compose configuration object.
 * @param {string} section - The section to check and potentially remove (e.g., 'volumes', 'networks').
 */
function removeEmptySection(compose, section) {
  if (compose[section] && Object.keys(compose[section]).length === 0) {
    delete compose[section];
  }
}

/**
 * Loads a YAML file and parses its content.
 *
 * @param {string} filePath - Path to the YAML file.
 * @returns {Object} - Parsed YAML content as a JavaScript object.
 */
function loadYamlFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    return yaml.load(fileContent) || {};
  } catch (error) {
    console.error(`Error loading YAML file at ${filePath}:`, error);
    return {};
  }
}

/**
 * Merges module configurations into the base compose configuration.
 *
 * @param {Object} baseCompose - The base docker-compose configuration.
 * @param {Object} moduleCompose - The module's docker-compose configuration.
 */
function mergeModuleCompose(baseCompose, moduleCompose) {
  // Merge services
  if (moduleCompose.services) {
    baseCompose.services = { ...baseCompose.services, ...moduleCompose.services };
  }

  // Merge volumes and networks using deep merge
  if (moduleCompose.volumes) {
    baseCompose.volumes = merge(baseCompose.volumes, moduleCompose.volumes);
  }

  if (moduleCompose.networks) {
    baseCompose.networks = merge(baseCompose.networks, moduleCompose.networks);
  }
}

/**
 * Cleans up the 'depends_on' field in services.
 *
 * @param {Object} services - The services section of the docker-compose file.
 */
function cleanDependsOn(services) {
  Object.values(services).forEach((service) => {
    if (service.depends_on) {
      if (Array.isArray(service.depends_on)) {
        service.depends_on = service.depends_on.filter((dep) => services[dep]);
        if (service.depends_on.length === 0) {
          delete service.depends_on;
        }
      } else if (typeof service.depends_on === "object") {
        Object.keys(service.depends_on).forEach((dep) => {
          if (!services[dep]) {
            delete service.depends_on[dep];
          }
        });
        if (Object.keys(service.depends_on).length === 0) {
          delete service.depends_on;
        }
      }
    }
  });
}

module.exports = {
  cleanConfig,
  removeEmptyObjects,
  removeEmptySection,
  loadYamlFile,
  mergeModuleCompose,
  cleanDependsOn,
};
