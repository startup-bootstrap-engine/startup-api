import { unitTestHelper } from "@providers/inversify/container";
import { guildChatLogMock } from "@providers/unitTests/mock/guildChatLogMock";
import { IGuildChatLog } from "../GuildChatLogModel";

describe("GuildChatLogModal.ts", () => {
  let testGuildChatLog: IGuildChatLog;

  beforeEach(async () => {
    testGuildChatLog = await unitTestHelper.createMockGuildChatLog();
  });

  it("Validate if the record is being created", () => {
    expect(testGuildChatLog).toBeDefined();
    expect(testGuildChatLog.message).toEqual(guildChatLogMock.message);
    expect(testGuildChatLog.emitter?.toString() ?? "").toEqual(guildChatLogMock.emitter?.toString());
    expect(testGuildChatLog.senderName).toEqual(guildChatLogMock.senderName);
    expect(testGuildChatLog.guild?.toString() ?? "").toEqual(guildChatLogMock.guild?.toString());
    expect(testGuildChatLog.status).toEqual(guildChatLogMock.status);
    expect(testGuildChatLog.createdAt).toBeDefined();
    expect(testGuildChatLog.updatedAt).toBeDefined();
  });
});
