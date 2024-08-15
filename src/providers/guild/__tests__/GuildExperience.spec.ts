import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills, IGuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import mongoose from "mongoose";
import { GuildExperience } from "../GuildExperience";

describe("GuildExperience.ts", () => {
  let guildExperience: GuildExperience;
  let testCharacter: ICharacter;
  let testGuild: IGuild;
  let guildSkills: IGuildSkills;

  const mockSocketMessaging = {
    sendEventToUser: jest.fn(),
  };

  beforeAll(() => {
    guildExperience = container.get<GuildExperience>(GuildExperience);
  });

  beforeEach(async () => {
    testGuild = await unitTestHelper.createMockGuild();
    testCharacter = await unitTestHelper.createMockCharacter();

    guildSkills = new GuildSkills({
      owner: testGuild._id,
    });
    await guildSkills.save();

    testGuild.members = [testCharacter._id];
    testGuild.guildLeader = testCharacter._id;
    testGuild.guildSkills = guildSkills._id;
    await testGuild.save();

    // @ts-ignore
    guildExperience.socketMessaging = mockSocketMessaging;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("should update guild experience without leveling up", async () => {
    const xp = guildSkills.xpToNextLevel * 2 - 10;
    await guildExperience.updateGuildExperience(testCharacter, xp);

    const newGuildSkills = await GuildSkills.findOne({ _id: guildSkills._id });
    expect(newGuildSkills?.experience).toEqual(Math.round(guildSkills.experience + xp / 10));
    expect(mockSocketMessaging.sendEventToUser).not.toHaveBeenCalled();
  });

  it("should update guild experience with leveling up", async () => {
    // @ts-ignore
    const notifyGuildMembersSpy = jest.spyOn(guildExperience.guildCommon, "notifyGuildMembers");

    const xp = guildSkills.xpToNextLevel * 20 + 10;

    const applyXPBonusForGuildLevelSpy = jest
      // @ts-ignore
      .spyOn<any, any>(guildExperience.guildLevelBonusXP, "applyXPBonusForGuildLevel")
      .mockResolvedValueOnce(null);

    await guildExperience.updateGuildExperience(testCharacter, xp);

    const newGuildSkills = await GuildSkills.findOne({ _id: guildSkills._id });
    expect(newGuildSkills?.experience).toEqual(Math.round(guildSkills.experience + xp / 10));
    expect(notifyGuildMembersSpy).toHaveBeenCalled();

    const callArgs = notifyGuildMembersSpy.mock.calls[0];
    expect(callArgs[0]).toEqual(expect.arrayContaining(testGuild.members));
    expect(callArgs[0].length).toBe(testGuild.members.length);
    expect(callArgs[1]).toBe(newGuildSkills?.level);
    expect(applyXPBonusForGuildLevelSpy).toHaveBeenCalled();
  });

  it("should do nothing if guild is not found", async () => {
    // @ts-ignore
    jest.spyOn(Guild, "findOne").mockReturnValueOnce(null);

    // @ts-ignore
    jest.spyOn(GuildSkills, "findOne").mockReturnValueOnce({
      lean: jest.fn().mockResolvedValueOnce(null),
    });
    const updateOneSpy = jest.spyOn(GuildSkills, "updateOne").mockImplementation();

    await guildExperience.updateGuildExperience(testCharacter, 10);

    expect(updateOneSpy).not.toHaveBeenCalled();
    expect(mockSocketMessaging.sendEventToUser).not.toHaveBeenCalled();
  });

  it("should not update if guild skills are not found", async () => {
    guildSkills.owner = new mongoose.Types.ObjectId();
    await guildSkills.save();

    const updateOneSpy = jest.spyOn(GuildSkills, "updateOne").mockImplementation();

    await guildExperience.updateGuildExperience(testCharacter, 30);

    expect(updateOneSpy).not.toHaveBeenCalled();
    expect(mockSocketMessaging.sendEventToUser).not.toHaveBeenCalled();
  });

  it("should update guild experience with leveling up", async () => {
    // @ts-ignore
    const notifyGuildMembersSpy = jest.spyOn(guildExperience.guildCommon, "notifyGuildMembers");
    const xp = guildSkills.xpToNextLevel * 20 + 10;

    const applyCharacterBuffSpy = jest
      // @ts-ignore
      .spyOn<any, any>(guildExperience.guildLevelBonus, "applyCharacterBuff")
      .mockResolvedValueOnce(null);

    await guildExperience.updateGuildExperience(testCharacter, xp);

    const newGuildSkills = await GuildSkills.findOne({ owner: testGuild.id });
    expect(newGuildSkills?.experience).toEqual(Math.round(guildSkills.experience + xp / 10));
    expect(notifyGuildMembersSpy).toHaveBeenCalled();

    const callArgs = notifyGuildMembersSpy.mock.calls[0];
    expect(callArgs[0]).toEqual(expect.arrayContaining(testGuild.members));
    expect(callArgs[0].length).toBe(testGuild.members.length);
    expect(callArgs[1]).toBe(newGuildSkills?.level);

    expect(applyCharacterBuffSpy).toHaveBeenCalled();
  });
});
