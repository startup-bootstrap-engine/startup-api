import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IGuild } from "@entities/ModuleSystem/GuildModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { Types } from "mongoose";
import { GuildLeave } from "../GuildLeave";

describe("GuildLeave.ts", () => {
  let guildLeave: GuildLeave;
  let testCharacter: ICharacter;
  let testCharacter2: ICharacter;
  let testCharacter3: ICharacter;
  let testGuild: IGuild;
  let testGuild2: IGuild;

  const mockSocketMessaging = {
    sendErrorMessageToCharacter: jest.fn(),
  };

  beforeAll(() => {
    guildLeave = container.get<GuildLeave>(GuildLeave);
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    testCharacter = await unitTestHelper.createMockCharacter();
    testCharacter2 = await unitTestHelper.createMockCharacter();
    testCharacter3 = await unitTestHelper.createMockCharacter();
    testGuild = await unitTestHelper.createMockGuild();

    testGuild.guildLeader = testCharacter._id;
    testGuild.members = [testCharacter._id, testCharacter2._id];
    await testGuild.save();

    testGuild2 = await unitTestHelper.createMockGuild();

    // @ts-ignore
    guildLeave.socketMessaging = mockSocketMessaging;
  });

  it("should send error message if member is not found", async () => {
    const guildId = testGuild._id;
    // random id
    const memberId = Types.ObjectId().toString();

    await guildLeave.leaveGuild(guildId, memberId, testCharacter);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, member not found."
    );
  });

  it("should send error message if member is not in a guild", async () => {
    const guildId = testGuild._id.toString();
    // testCharacter3 is not in a guild
    const memberId = testCharacter3._id.toString();

    await guildLeave.leaveGuild(guildId, memberId, testCharacter as any);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, member is not in a guild."
    );
  });

  it("should send error message if member is not in the specified guild", async () => {
    const guildId = testGuild._id.toString();
    const memberId = testCharacter3._id.toString();

    testGuild2.members = [testCharacter3._id];
    await testGuild2.save();

    await guildLeave.leaveGuild(guildId, memberId, testCharacter as any);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, member is not in this guild."
    );
  });

  it("should send error message if non-leader tries to remove another member", async () => {
    const guildId = testGuild._id.toString();
    const memberId = testCharacter._id.toString();
    // testCharacter2 is not the leader but removing testCharacter
    await guildLeave.leaveGuild(guildId, memberId, testCharacter2 as any);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter2,
      "Sorry, you are not the leader of this guild."
    );
  });

  it("should successfully remove member from guild", async () => {
    const guildId = testGuild._id.toString();
    const memberId = testCharacter2._id.toString();

    const sendMessageToAllMembersSpy = jest
      // @ts-ignore
      .spyOn<any, any>(guildLeave.guildCommon, "sendMessageToAllMembers")
      .mockResolvedValueOnce(null);

    await guildLeave.leaveGuild(guildId, memberId, testCharacter as any);

    expect(sendMessageToAllMembersSpy).toHaveBeenCalledWith(
      expect.stringContaining("has left the guild."),
      expect.objectContaining({
        _id: testGuild._id,
        name: testGuild.name,
        tag: testGuild.tag,
        coatOfArms: testGuild.coatOfArms,
      }),
      false,
      expect.arrayContaining([testCharacter._id.toString(), testCharacter2._id.toString()])
    );
  });
});
