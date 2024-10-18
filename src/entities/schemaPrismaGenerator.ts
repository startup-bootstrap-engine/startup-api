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

// Prisma schema header
const prismaSchemaHeader = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

`;

// Generate Prisma schema
async function generatePrismaSchemaFile(): Promise<void> {
  try {
    // Generate the complete Prisma schema
    const prismaSchemaContent = generatePrismaSchema(models, schemaToModelName, modelNameToSchema);

    // Combine with header
    const completePrismaSchema = `${prismaSchemaHeader}\n${prismaSchemaContent}\n`;

    // Write to schema.prisma
    const schemaPath = path.join(PRISMA_SCHEMA_PATH, "schema.prisma");
    await fs.writeFile(schemaPath, completePrismaSchema, { encoding: "utf-8" });

    console.log("✅ Prisma schema generated successfully.");
  } catch (error) {
    console.error("❌ Failed to generate Prisma schema:", error);
    process.exit(1);
  }
}

void generatePrismaSchemaFile();
