import { createLeanSchema } from "@providers/database/mongooseHelpers";
import { ExtractDoc, Type, typedModel } from "ts-mongoose";

const guildChatLogSchema = createLeanSchema(
  {
    message: Type.string({ required: true }),
    emitter: Type.objectId({
      ref: "Character",
      index: true,
    }),
    senderName: Type.string({ required: true }),
    guild: Type.objectId({
      ref: "Guild",
      index: true,
    }),
    status: Type.string({ required: true }),
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type IGuildChatLog = ExtractDoc<typeof guildChatLogSchema>;

export const GuildChatLog = typedModel("GuildChatLog", guildChatLogSchema);
