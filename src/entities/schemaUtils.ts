import Joi, { ObjectSchema, ValidationResult } from "joi";
import mongoose, { Document, Model, Schema, SchemaDefinition, SchemaTypeOpts } from "mongoose";

/**
 * Converts a Joi schema to a Mongoose SchemaDefinition.
 * @param joiSchema - The Joi schema to convert.
 * @returns A Mongoose SchemaDefinition.
 */
export function joiToMongoose(joiSchema: ObjectSchema): SchemaDefinition {
  const mongooseSchemaDefinition: SchemaDefinition = {};

  const describe = joiSchema.describe();

  for (const [key, value] of Object.entries(describe.keys) as [string, any][]) {
    const mongooseField: SchemaTypeOpts<any> = {};

    // Map Joi types to Mongoose types
    switch (value.type) {
      case "string":
        mongooseField.type = String;
        if (value.rules) {
          value.rules.forEach((rule: any) => {
            if (rule.name === "min") {
              mongooseField.minlength = rule.args.limit;
            }
            if (rule.name === "max") {
              mongooseField.maxlength = rule.args.limit;
            }
            if (rule.name === "email") {
              mongooseField.match = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            }
            if (rule.name === "regex") {
              mongooseField.match = new RegExp(rule.args.pattern);
            }
            if (rule.name === "valid") {
              mongooseField.enum = rule.args.allow;
            }
          });
        }
        break;

      case "number":
        mongooseField.type = Number;
        if (value.rules) {
          value.rules.forEach((rule: any) => {
            if (rule.name === "min") {
              mongooseField.min = rule.args.limit;
            }
            if (rule.name === "max") {
              mongooseField.max = rule.args.limit;
            }
            if (rule.name === "integer") {
              mongooseField.validate = {
                validator: Number.isInteger,
                message: "{VALUE} is not an integer value",
              };
            }
          });
        }
        break;

      case "boolean":
        mongooseField.type = Boolean;
        break;

      case "date":
        mongooseField.type = Date;
        break;

      case "array":
        if (value.items && value.items.length > 0) {
          // Assuming array of strings for simplicity
          const itemType = value.items[0].type;
          switch (itemType) {
            case "string":
              mongooseField.type = [String];
              break;
            case "number":
              mongooseField.type = [Number];
              break;
            case "boolean":
              mongooseField.type = [Boolean];
              break;
            case "object":
              mongooseField.type = [Schema.Types.Mixed];
              break;
            default:
              mongooseField.type = [Schema.Types.Mixed];
          }
        } else {
          mongooseField.type = Array;
        }
        break;

      case "object":
        mongooseField.type = Schema.Types.Mixed;
        break;

      default:
        mongooseField.type = Schema.Types.Mixed;
    }

    // Handle default values
    if (value.flags && value.flags.default !== undefined) {
      mongooseField.default = typeof value.flags.default === "function" ? value.flags.default() : value.flags.default;
    }

    // Handle required fields
    mongooseField.required = value.flags?.presence === "required";

    // Handle uniqueness
    if (value.flags?.unique) {
      mongooseField.unique = true;
    }

    // Assign the field to the schema definition
    mongooseSchemaDefinition[key] = mongooseField;
  }

  return mongooseSchemaDefinition;
}

/**
 * Creates a Mongoose model from a Joi schema.
 * Checks if the model already exists to prevent OverwriteModelError.
 * @param modelName - The name of the model.
 * @param joiSchema - The Joi schema to convert.
 * @returns A Mongoose model.
 */
export function createMongooseModel<T extends Document>(modelName: string, joiSchema: ObjectSchema): Model<T> {
  // Check if the model already exists in Mongoose's model registry
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName] as Model<T>;
  }

  // Convert Joi schema to Mongoose schema definition
  const mongooseSchemaDefinition: SchemaDefinition = joiToMongoose(joiSchema);

  // Create a new Mongoose schema
  const schema = new Schema(mongooseSchemaDefinition, { timestamps: true });

  // Create and return the Mongoose model
  return mongoose.model<T>(modelName, schema);
}

/**
 * Validates and sanitizes data using the provided Joi schema.
 * Populates default values as defined in the schema.
 *
 * @param joiSchema - The Joi schema to validate against.
 * @param data - The input data to validate.
 * @param options - Optional Joi validation options.
 * @returns The validated and sanitized object.
 * @throws An error if validation fails.
 */
export function joiToObject<T>(joiSchema: ObjectSchema, data: any, options?: Joi.ValidationOptions): T {
  const { value, error }: ValidationResult = joiSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    ...options,
  });

  if (error) {
    // Customize error handling as needed
    const errorMessages = error.details.map((detail) => detail.message).join(", ");
    throw new Error(`Joi validation error: ${errorMessages}`);
  }

  return value as T;
}
