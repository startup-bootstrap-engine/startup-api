import config from "@generated/docusaurus.config";
import { EnvKeys } from "@site/docusaurus.config";

export const getEnv = (key: EnvKeys): string => {
  const customFields = config.customFields as { [key: string]: string };

  return customFields[key] || "";
};
