import { IGuildChatLog } from "@entities/ModuleSystem/GuildChatLogModel";
import { Types } from "mongoose";

export const guildChatLogMock: Partial<IGuildChatLog> = {
  message: "Hello, guild members!",
  emitter: "6233ff328f3b09002fe32f9d" as unknown as Types.ObjectId,
  senderName: "TestUser",
  guild: "6233ff328f3b09002fe32f9e" as unknown as Types.ObjectId,
  status: "sent",
};
