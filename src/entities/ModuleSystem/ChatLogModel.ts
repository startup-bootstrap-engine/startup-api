import { createLeanSchema } from "@providers/database/mongooseHelpers";
import { ChatMessageType, TypeHelper } from "@startup-engine/shared";
import { ExtractDoc, Type, typedModel } from "ts-mongoose";

const chatLogSchema = createLeanSchema(
  {
    message: Type.string({ required: true }),
    emitter: Type.objectId({
      ref: "Character",
      index: true,
    }),
    type: Type.string({
      required: true,
      default: ChatMessageType.Local,
      enum: TypeHelper.enumToStringArray(ChatMessageType),
    }),
    x: Type.number({ required: true }),
    y: Type.number({ required: true }),
    scene: Type.string({ required: true }),
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

chatLogSchema.index({ x: 1, y: 1, scene: 1, createdAt: -1 });

export type IChatLog = ExtractDoc<typeof chatLogSchema>;

export const ChatLog = typedModel("ChatLog", chatLogSchema);
