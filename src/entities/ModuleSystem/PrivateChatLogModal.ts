import { createLeanSchema } from "@providers/database/mongooseHelpers";
import { ExtractDoc, Type, typedModel } from "ts-mongoose";

const privateChatLogSchema = createLeanSchema(
  {
    message: Type.string({ required: true }),
    emitter: Type.objectId({
      ref: "Character",
      index: true,
    }),
    receiver: Type.objectId({
      ref: "Character",
      index: true,
    }),
    status: Type.string({ required: true }),
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type IPrivateChatLog = ExtractDoc<typeof privateChatLogSchema>;

export const PrivateChatLog = typedModel("PrivateChatLog", privateChatLogSchema);
