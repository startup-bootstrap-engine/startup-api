import { createLeanSchema } from "@providers/database/mongooseHelpers";
import { ExtractDoc, Type, typedModel } from "ts-mongoose";

const tradeChatLogSchema = createLeanSchema(
  {
    message: Type.string({ required: true }),
    emitter: Type.objectId({
      ref: "Character",
      index: true,
    }),
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type ITradeChatLog = ExtractDoc<typeof tradeChatLogSchema>;

export const TradeChatLog = typedModel("TradeChatLog", tradeChatLogSchema);
