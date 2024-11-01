import { PRISMA_SCHEMA_PATH } from "@providers/constants/PathConstants";
import * as sharedSchemas from "@startup-engine/shared";
import fs from "fs/promises";
import { glob } from "glob";
import { camelCase as lodashCamelCase } from "lodash";
import path from "path";
import { z } from "zod";
import { generatePrismaSchema } from "./schemaPrismaTools";

/**
 * Utility function to find model files using glob.
 * It searches for all files ending with 'Model.ts' excluding those that contain 'BaseModel'.
 */
async function findModelFiles(modelsDir: string): Promise<string[]> {
  const pattern = "**/*Model.ts"; // Match all files ending with 'Model.ts'
  const options = {
    cwd: modelsDir, // Set the current working directory
    absolute: true, // Return absolute paths
    ignore: "**/*BaseModel*.ts", // Exclude any files containing 'BaseModel'
  };

  try {
    const files = await glob(pattern, options);
    return files;
  } catch (error) {
    console.error("❌ Glob pattern matching failed:", error);
    throw error;
  }
}

async function loadModels(): Promise<Array<{ name: string; schema: z.ZodSchema<any> }>> {
  const modelsDir = path.join(__dirname, "ModuleSystem");
  console.log(`Loading models from directory: ${modelsDir}`);

  let modelFilePaths: string[];
  try {
    modelFilePaths = await findModelFiles(modelsDir);
  } catch (readError) {
    console.error(`❌ Failed to find model files: ${readError.message}`);
    throw readError;
  }

  if (modelFilePaths.length === 0) {
    console.warn("⚠️ No model files found. Please check the models directory and glob pattern.");
  }

  const models: Array<{ name: string; schema: z.ZodSchema<any> }> = [];

  for (const filePath of modelFilePaths) {
    const fileName = path.basename(filePath);
    const modelName = fileName.replace(/Model\.ts$/, "");
    // Use lodash's camelCase for accurate conversion
    const camelCase = lodashCamelCase(modelName);

    const schemaName = `${camelCase}Schema`;
    const pluralSchemaName = `${camelCase}sSchema`;

    const schema = (sharedSchemas as any)[schemaName] || (sharedSchemas as any)[pluralSchemaName];

    if (schema instanceof z.ZodType) {
      models.push({
        name: modelName,
        schema,
      });
      console.log(`✅ Loaded schema for model: ${modelName} as "${schemaName}"`);
    } else {
      console.warn(`❌ No schema found for model: ${modelName} (looked for "${schemaName}" or "${pluralSchemaName}")`);
      // Optionally, skip logging warnings for models without schemas by commenting out the line above.
    }
  }

  return models;
}

function createMappings(models: Array<{ name: string; schema: z.ZodSchema<any> }>): {
  schemaToModelName: Map<z.ZodSchema<any>, string>;
  modelNameToSchema: Map<string, z.ZodSchema<any>>;
} {
  const schemaToModelName = new Map<z.ZodSchema<any>, string>();
  const modelNameToSchema = new Map<string, z.ZodSchema<any>>();

  models.forEach((model) => {
    schemaToModelName.set(model.schema, model.name);
    modelNameToSchema.set(model.name, model.schema);
  });

  console.log("Mappings created: schemaToModelName and modelNameToSchema");
  return { schemaToModelName, modelNameToSchema };
}

const prismaSchemaHeader = `
datasource db {
  provider = "postgresql"
  url      = env("POSTGRESQL_DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
`;

async function generatePrismaSchemaFile(): Promise<void> {
  try {
    console.log("🔄 Starting Prisma schema generation...");
    const models = await loadModels();

    if (models.length === 0) {
      console.warn("⚠️ No models loaded. Prisma schema generation will be skipped.");
      return;
    }

    const { schemaToModelName, modelNameToSchema } = createMappings(models);
    const prismaSchemaContent = generatePrismaSchema(models, schemaToModelName, modelNameToSchema);
    const completePrismaSchema = `${prismaSchemaHeader}\n${prismaSchemaContent}\n`;

    console.log("✅ Generated Prisma schema content.");

    const schemaDir = path.dirname(PRISMA_SCHEMA_PATH);
    await fs.mkdir(schemaDir, { recursive: true });
    console.log(`📂 Ensured schema directory exists: ${schemaDir}`);

    await fs.writeFile(PRISMA_SCHEMA_PATH, completePrismaSchema, { encoding: "utf-8" });
    console.log(`✅ Prisma schema generated successfully at ${PRISMA_SCHEMA_PATH}`);
  } catch (error) {
    console.error("❌ Failed to generate Prisma schema:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    process.exit(1);
  }
}

void generatePrismaSchemaFile();
