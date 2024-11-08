import { PRISMA_SCHEMA_PATH } from "@providers/constants/PathConstants";
import { abTestSchema, userSchema } from "@startup-engine/shared";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { generatePrismaSchema } from "./schemaPrismaTools";

// Initialize models
const models = [
  { name: "User", schema: userSchema },
  { name: "ABTest", schema: abTestSchema },
  // Add more models as needed
];

// Create mappings
const schemaToModelName = new Map<z.ZodSchema<any>, string>();
const modelNameToSchema = new Map<string, z.ZodSchema<any>>();
models.forEach((model) => {
  schemaToModelName.set(model.schema, model.name);
  modelNameToSchema.set(model.name, model.schema);
});

// Generate Prisma schema
async function generatePrismaSchemaFile(): Promise<void> {
  try {
    // Generate the complete Prisma schema
    const prismaSchema = generatePrismaSchema(models, schemaToModelName, modelNameToSchema);

    // Ensure the directory exists
    const schemaDir = path.dirname(PRISMA_SCHEMA_PATH);
    await fs.mkdir(schemaDir, { recursive: true });

    // Write to schema.prisma
    await fs.writeFile(PRISMA_SCHEMA_PATH, prismaSchema, { encoding: "utf-8" });

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
