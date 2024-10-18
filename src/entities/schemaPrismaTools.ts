/* eslint-disable no-prototype-builtins */
/* eslint-disable mongoose-performance/require-lean */
// zodToPrisma.ts
import {
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodEffects,
  ZodEnum,
  ZodLiteral,
  ZodNativeEnum,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodSchema,
  ZodString,
  ZodTypeAny,
} from "zod";

// Interface to represent Prisma fields
interface IPrismaField {
  name: string;
  type: string;
  isRequired: boolean;
  isUnique?: boolean;
  isId?: boolean;
  isAutoIncrement?: boolean;
  default?: string;
  isEnum?: boolean;
  isRelation?: boolean;
  relationModel?: string;
  relationName?: string;
  relationFields?: string[];
  references?: string[];
}

// Interface for Prisma enums
interface IPrismaEnum {
  name: string;
  values: string[];
}

const enums: IPrismaEnum[] = [];

// Helper function to capitalize strings
function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Function to convert Zod types to Prisma types
function zodTypeToPrisma(zodType: ZodTypeAny): string {
  // Handle ZodEffects by unwrapping
  if (zodType instanceof ZodEffects) {
    return zodTypeToPrisma(zodType._def.schema);
  }

  if (zodType instanceof ZodString) {
    return "String";
  }
  if (zodType instanceof ZodNumber) {
    // Determine if it's Int or Float based on Zod refinements
    if (zodType.isInt) {
      return "Int";
    }
    return "Float";
  }
  if (zodType instanceof ZodBoolean) {
    return "Boolean";
  }
  if (zodType instanceof ZodDate) {
    return "DateTime";
  }
  if (zodType instanceof ZodArray) {
    const elementType = zodTypeToPrisma(zodType.element);
    return `${elementType}[]`;
  }
  if (zodType instanceof ZodEnum) {
    const enumName = `${capitalize(zodType._def.values[0])}Enum`; // Example naming
    if (!enums.find((e) => e.name === enumName)) {
      enums.push({
        name: enumName,
        values: zodType._def.values,
      });
    }
    return enumName;
  }
  if (zodType instanceof ZodNativeEnum) {
    const enumObj = zodType._def.values;
    const enumValues = Object.values(enumObj).filter((v) => typeof v === "string") as string[];
    const enumName = `${capitalize(enumValues[0])}Enum`;

    if (!enums.find((e) => e.name === enumName)) {
      enums.push({
        name: enumName,
        values: enumValues,
      });
    }
    return enumName;
  }
  if (zodType instanceof ZodLiteral) {
    const literalValue = zodType._def.value;
    if (typeof literalValue === "string") {
      return `String @default("${literalValue}")`;
    }
    if (typeof literalValue === "number") {
      return `Int @default(${literalValue})`;
    }
    if (typeof literalValue === "boolean") {
      return `Boolean @default(${literalValue})`;
    }
    // Handle other literal types as needed
  }
  if (zodType instanceof ZodObject) {
    // Map ZodObject to Prisma's Json type
    return "Json";
  }
  // Add more type mappings as needed
  throw new Error(`Unsupported Zod type: ${zodType.constructor.name}`);
}

// Function to extract Prisma fields from ZodObject
function extractPrismaFields(zodObject: ZodObject<any>): IPrismaField[] {
  const shape = zodObject.shape;
  const fields: IPrismaField[] = [];

  // Check if 'id' field exists; if not, add it
  if (!shape.hasOwnProperty("id")) {
    fields.push({
      name: "id",
      type: "String",
      isRequired: true,
      isUnique: true,
      isId: true,
      isAutoIncrement: false,
      default: "uuid()",
    });
  }

  for (const [key, value] of Object.entries(shape)) {
    // Skip 'id' if it's already handled
    if (key === "id") {
      const zodType = value as ZodTypeAny;
      const prismaType = zodTypeToPrisma(zodType);
      fields.push({
        name: "id",
        type: "String",
        isRequired: true,
        isId: true,
        isUnique: true,
        isAutoIncrement: false,
        default: "uuid()",
      });
      continue;
    }

    let isRequired = true;
    let isUnique = false;
    const isId = false;
    const isAutoIncrement = false;
    let defaultValue: string | undefined;
    let isEnum = false;
    let isRelation = false;
    let relationModel: string | undefined;
    let relationFields: string[] = [];
    let references: string[] = [];
    let zodType: ZodTypeAny = value as ZodTypeAny;

    // Continuously unwrap ZodOptional, ZodNullable, ZodDefault, ZodEffects
    while (
      zodType instanceof ZodOptional ||
      zodType instanceof ZodNullable ||
      zodType instanceof ZodDefault ||
      zodType instanceof ZodEffects
    ) {
      if (zodType instanceof ZodOptional || zodType instanceof ZodNullable) {
        isRequired = false;
        zodType = zodType.unwrap();
      } else if (zodType instanceof ZodDefault) {
        const defaultVal = zodType._def.defaultValue();
        zodType = zodType._def.innerType;

        // Determine default value in Prisma syntax
        if (zodType instanceof ZodBoolean) {
          defaultValue = defaultVal ? "true" : "false";
        } else if (zodType instanceof ZodString) {
          defaultValue = `"${defaultVal}"`;
        } else if (zodType instanceof ZodNumber) {
          defaultValue = `${defaultVal}`;
        } else if (zodType instanceof ZodDate) {
          defaultValue = "now()"; // Assuming default is current date
        } else if (zodType instanceof ZodEnum || zodType instanceof ZodNativeEnum) {
          // For enums, default value should be the enum value without quotes
          defaultValue = `${defaultVal}`;
        }
        // Add more default value handling as needed
      } else if (zodType instanceof ZodEffects) {
        zodType = zodType._def.schema;
      }
    }

    // Handle specific constraints (e.g., unique, id)
    // For more flexibility, consider using Zod's .describe() or custom metadata
    if (key.toLowerCase().includes("email")) {
      isUnique = true;
    }

    // Handle enums
    if (zodType instanceof ZodEnum || zodType instanceof ZodNativeEnum) {
      isEnum = true;
    }

    // Handle relations based on naming convention (e.g., channelId)
    if (key.endsWith("Id") && (zodType instanceof ZodString || zodType instanceof ZodNumber)) {
      isRelation = true;
      const relationModelName = key.slice(0, -2); // Remove 'Id' to get the model name
      relationModel = capitalize(relationModelName);
      relationFields = [key];
      references = ["id"];
    }

    let prismaType: string;
    try {
      prismaType = zodTypeToPrisma(zodType);
    } catch (error: any) {
      console.error(`Error processing field "${key}": ${error.message}`);
      throw error;
    }

    fields.push({
      name: key,
      type: prismaType,
      isRequired,
      isUnique,
      isId,
      isAutoIncrement,
      default: defaultValue,
      isEnum,
      isRelation,
      relationModel,
      relationFields,
      references,
    });
  }

  return fields;
}

// Function to generate Prisma model from Zod schema
function generatePrismaModel(modelName: string, zodSchema: ZodSchema<any>): string {
  if (!(zodSchema instanceof ZodObject)) {
    throw new Error("Only ZodObject schemas are supported for Prisma model generation.");
  }

  const fields = extractPrismaFields(zodSchema);

  const prismaFields: string[] = [];

  // To keep track of relation fields to avoid duplication
  const processedRelations = new Set<string>();

  fields.forEach((field) => {
    let line = `  ${field.name} ${field.type}`;

    // Append '?' immediately after the type if the field is not required
    if (!field.isRequired) {
      line += "?";
    }

    if (field.isId) line += " @id";
    if (field.isUnique) line += " @unique";
    if (field.isAutoIncrement) line += " @default(autoincrement())";
    if (field.default && !field.isEnum) {
      // Enums are handled differently
      line += ` @default(${field.default})`;
    }
    if (field.isEnum && field.default) {
      line += ` @default(${field.default})`;
    }
    // Only add @relation to foreign key fields if not already part of a relation
    if (field.isRelation && field.relationModel) {
      // Do NOT add @relation to the foreign key field
      // The @relation should be on the relation field
      // Hence, skip adding @relation here
    }

    prismaFields.push(line);

    // If it's a relation, add the relation field
    if (field.isRelation && field.relationModel && !processedRelations.has(field.relationModel)) {
      // Generate the relation field name in lowercase for the related model's back-reference
      const relationFieldName = field.relationModel.toLowerCase();

      // Define the relation field (e.g., channel Channel? @relation(...))
      const relationLine = `  ${relationFieldName} ${
        field.relationModel
      }? @relation(fields: [${field.relationFields?.join(", ")}], references: [${field.references?.join(", ")}])`;

      // Avoid duplicating relation fields
      if (!prismaFields.includes(relationLine)) {
        prismaFields.push(relationLine);
        processedRelations.add(field.relationModel);
      }
    }
  });

  return `model ${modelName} {\n${prismaFields.join("\n")}\n}`;
}

// Function to generate Prisma enums
function generatePrismaEnums(): string {
  return enums
    .map((enumObj) => {
      const values = enumObj.values.map((v) => `  ${v}`).join("\n");
      return `enum ${enumObj.name} {\n${values}\n}`;
    })
    .join("\n\n");
}

// Export functions
export { generatePrismaEnums, generatePrismaModel };
