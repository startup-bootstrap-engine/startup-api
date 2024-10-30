/* eslint-disable no-prototype-builtins */
/* eslint-disable mongoose-performance/require-lean */
import {
  z,
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

// Collection of enums to avoid duplication
const enums: IPrismaEnum[] = [];

// Function to generate unique enum names
function getEnumName(fieldName: string): string {
  return `${capitalize(fieldName)}Enum`;
}

// Helper function to capitalize strings
function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Function to convert Zod types to Prisma types
function zodTypeToPrisma(
  zodType: ZodTypeAny,
  fieldName: string,
  schemaToModelName: Map<ZodSchema<any>, string>
): string {
  // Handle ZodEffects by unwrapping
  if (zodType instanceof ZodEffects) {
    return zodTypeToPrisma(zodType._def.schema, fieldName, schemaToModelName);
  }

  if (zodType instanceof ZodString) {
    return "String";
  }
  if (zodType instanceof ZodNumber) {
    // Determine if it's Int or Float based on Zod refinements
    if ((zodType as any)._def.checks?.some((check: any) => check.kind === "int")) {
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
    const elementType = zodType.element;
    const relatedModelName = schemaToModelName.get(elementType);
    if (relatedModelName) {
      return `${relatedModelName}[]`;
    }
    const prismaElementType = zodTypeToPrisma(elementType, fieldName, schemaToModelName);
    return `${prismaElementType}[]`;
  }
  if (zodType instanceof ZodEnum) {
    const enumName = getEnumName(fieldName);
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
    const enumName = getEnumName(fieldName);

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
    throw new Error(`Unsupported ZodLiteral type: ${typeof literalValue}`);
  }
  if (zodType instanceof ZodObject) {
    const relatedModelName = schemaToModelName.get(zodType);
    if (relatedModelName) {
      return relatedModelName;
    }
    return "Json";
  }
  // Add more type mappings as needed
  throw new Error(`Unsupported Zod type: ${zodType.constructor.name}`);
}

// Function to extract Prisma fields from ZodObject
function extractPrismaFields(
  zodObject: ZodObject<any>,
  schemaToModelName: Map<ZodSchema<any>, string>,
  modelName: string,
  modelNameToRelations: Map<string, any>
): IPrismaField[] {
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
      // Assuming 'id' is a string with default uuid
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
    let relationName: string | undefined;
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

    // Automatically infer relations
    if (key.endsWith("Id") && (zodType instanceof ZodString || zodType instanceof ZodNumber)) {
      const relatedModelName = capitalize(key.slice(0, -2)); // Remove 'Id' and capitalize
      if (modelNameToRelations.has(relatedModelName)) {
        // Related model exists
        isRelation = true;
        relationModel = relatedModelName;
        relationName = `${modelName}To${relatedModelName}`;
        relationFields = [key];
        references = ["id"];
        isUnique = true; // Assuming one-to-one or many-to-one relation

        // Record the relation to add back-reference later
        const relatedRelations = modelNameToRelations.get(relatedModelName) || [];
        relatedRelations.push({
          relationName: relationName,
          relatedModel: modelName,
          type: "many", // Could be "one" or "many", infer based on context
        });
        modelNameToRelations.set(relatedModelName, relatedRelations);
      }
    }

    // Handle relations defined as nested objects or arrays
    if (zodType instanceof ZodObject || (zodType instanceof ZodArray && zodType.element instanceof ZodObject)) {
      const relatedSchema = zodType instanceof ZodArray ? zodType.element : zodType;
      const relatedModelName = schemaToModelName.get(relatedSchema);
      if (relatedModelName) {
        isRelation = true;
        relationModel = relatedModelName;
        relationName = `${modelName}To${relatedModelName}`;
        if (zodType instanceof ZodArray) {
          // One-to-Many or Many-to-Many relation
          // Assume Many-to-Many for now
          relationFields = []; // No foreign key field here
          // Record the relation to add back-reference later
          const relatedRelations = modelNameToRelations.get(relatedModelName) || [];
          relatedRelations.push({
            relationName: relationName,
            relatedModel: modelName,
            type: "many",
          });
          modelNameToRelations.set(relatedModelName, relatedRelations);
        } else {
          // One-to-One or Many-to-One relation
          // Add foreign key field
          const foreignKeyName = `${key}Id`;
          fields.push({
            name: foreignKeyName,
            type: "String",
            isRequired: false,
            isUnique: true,
            isRelation: true,
            relationModel: relatedModelName,
            relationName,
            relationFields: [foreignKeyName],
            references: ["id"],
          });
        }
      }
    }

    let prismaType: string;
    try {
      prismaType = zodTypeToPrisma(zodType, key, schemaToModelName);
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
      relationName,
      relationFields,
      references,
    });
  }

  return fields;
}

// Function to generate Prisma model from Zod schema
function generatePrismaModel(
  modelName: string,
  zodSchema: ZodSchema<any>,
  schemaToModelName: Map<ZodSchema<any>, string>,
  modelNameToRelations: Map<string, any>
): string {
  if (!(zodSchema instanceof ZodObject)) {
    throw new Error("Only ZodObject schemas are supported for Prisma model generation.");
  }

  const fields = extractPrismaFields(zodSchema, schemaToModelName, modelName, modelNameToRelations);

  const prismaFields: string[] = [];

  fields.forEach((field) => {
    let line = `  ${field.name} ${field.type}`;

    // Append '?' immediately after the type if the field is not required
    if (!field.isRequired && !field.isRelation) {
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

    // Handle relations
    if (field.isRelation && field.relationModel) {
      if (field.type.endsWith("[]")) {
        // One-to-Many or Many-to-Many relation
        line += ` @relation("${field.relationName || modelName + "_" + field.relationModel}")`;
      } else {
        // One-to-One or Many-to-One relation
        line += ` @relation("${field.relationName || modelName + "_" + field.relationModel}", fields: [${
          field.name
        }], references: [id])`;
      }
    }

    prismaFields.push(line);
  });

  // Add back-references based on recorded relations
  const relations = modelNameToRelations.get(modelName) || [];
  relations.forEach((rel: any) => {
    if (rel.type === "many") {
      const relationFieldName = rel.relatedModel.toLowerCase() + "s";
      prismaFields.push(`  ${relationFieldName} ${rel.relatedModel}[] @relation("${rel.relationName}")`);
    }
    // Handle other relation types as needed
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

// Function to generate the complete Prisma schema
function generatePrismaSchema(
  models: { name: string; schema: ZodSchema<any> }[],
  schemaToModelName: Map<ZodSchema<any>, string>,
  modelNameToSchema: Map<string, ZodSchema<any>>
): string {
  // Initialize a map to track relations for back-references
  const modelNameToRelations = new Map<string, any>();

  // Generate models
  const prismaModels = models
    .map(({ name, schema }) => generatePrismaModel(name, schema, schemaToModelName, modelNameToRelations))
    .join("\n\n");

  // Generate enums
  const prismaEnums = generatePrismaEnums();

  // Combine enums and models
  const prismaSchema = `${prismaEnums}\n\n${prismaModels}`;

  return prismaSchema;
}

// Function to handle relations, currently not used, can be integrated if needed
function handleRelations(modelString: string, schema: z.ZodObject<any>): string {
  // Implementation can be added as needed
  return modelString;
}

// Export functions
export { generatePrismaEnums, generatePrismaModel, generatePrismaSchema, handleRelations };
