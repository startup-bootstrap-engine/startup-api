// generatePrismaSchema.ts
import { PRISMA_SCHEMA_PATH } from "@providers/constants/PathConstants";
import { abTestSchema, userSchema } from "@startup-engine/shared";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { generatePrismaEnums, generatePrismaModel, handleRelations } from "./schemaPrismaTools";

// Define any additional schemas here
const ChannelSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

// Initialize models
const models = [
  { name: "User", schema: userSchema },
  { name: "ABTest", schema: abTestSchema },
  { name: "Channel", schema: ChannelSchema },
  // Add more models as needed
];

// Create a mapping from Zod schemas to model names
const schemaToModelName = new Map<z.ZodSchema<any>, string>();
models.forEach((model) => schemaToModelName.set(model.schema, model.name));

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

// Generate models and enums
const prismaModels = models
  .map((model) => {
    const modelString = generatePrismaModel(model.name, model.schema, schemaToModelName);
    return handleRelations(modelString, model.schema);
  })
  .join("\n\n");
const prismaEnums = generatePrismaEnums();

// Combine all parts
const prismaSchema = `${prismaSchemaHeader}\n${prismaEnums}\n\n${prismaModels}\n`;

// Write to schema.prisma
fs.writeFileSync(path.join(PRISMA_SCHEMA_PATH, "schema.prisma"), prismaSchema);

console.log("✅ Prisma schema generated successfully.");
