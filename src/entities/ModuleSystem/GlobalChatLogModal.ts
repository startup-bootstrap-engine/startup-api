import { createLeanSchema } from "@providers/database/mongooseHelpers";
import { ExtractDoc, Type, typedModel } from "ts-mongoose";

const globalChatLogSchema = createLeanSchema(
  {
    message: Type.string({ required: true }),
    emitter: Type.objectId({
      ref: "Character",
      index: true,
    }),
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type IGlobalChatLog = ExtractDoc<typeof globalChatLogSchema>;

export const GlobalChatLog = typedModel("GlobalChatLog", globalChatLogSchema);
