import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IGuild } from "@entities/ModuleSystem/GuildModel";
import { GuildSkills, IGuildSkills } from "@entities/ModuleSystem/GuildSkillsModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { GuildSocketEvents } from "@rpg-engine/shared";
import { GuildGet } from "../GuildGet";

describe("GuildGet.ts", () => {
  let testGuild: IGuild;
  let testCharacter: ICharacter;
  let testCharacter2: ICharacter;
  let guildGet: GuildGet;
  let guildSkills: IGuildSkills;

  const mockSocketMessaging = {
    sendEventToUser: jest.fn(),
  };

  beforeAll(() => {
    guildGet = container.get<GuildGet>(GuildGet);
  });

  beforeEach(async () => {
    testGuild = await unitTestHelper.createMockGuild();
    testCharacter = await unitTestHelper.createMockCharacter();
    testCharacter2 = await unitTestHelper.createMockCharacter();

    guildSkills = new GuildSkills({
      owner: testGuild._id,
    });
    await guildSkills.save();

    testGuild.members = [testCharacter._id];
    testGuild.guildLeader = testCharacter._id;
    testGuild.guildSkills = guildSkills._id;
    await testGuild.save();

    // @ts-ignore
    guildGet.socketMessaging = mockSocketMessaging;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should fetch and send guild if guildId is provided", async () => {
    await guildGet.getGuilds(testGuild.id, testCharacter);

    const guildSkillsInfo = [
      { name: "fire", level: 1, xp: 0 },
      { name: "water", level: 1, xp: 0 },
      { name: "earth", level: 1, xp: 0 },
      { name: "air", level: 1, xp: 0 },
      { name: "corruption", level: 1, xp: 0 },
      { name: "nature", level: 1, xp: 0 },
    ];

    expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledWith(
      testCharacter.channelId!,
      GuildSocketEvents.GuildInfoOpen,
      expect.objectContaining({
        _id: testGuild.id,
        name: testGuild.name,
        tag: testGuild.tag,
        coatOfArms: testGuild.coatOfArms,
        guildSkills: guildSkillsInfo,
        guidLevel: 1,
      })
    );
  });

  it("should fetch and send guild if guildId is not provided but character is in a guild", async () => {
    const character = {
      _id: testGuild.guildLeader,
      channelId: testCharacter.channelId,
    };

    await guildGet.getGuilds(undefined, character as ICharacter);

    expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledWith(
      testCharacter.channelId!,
      GuildSocketEvents.GuildInfoOpen,
      expect.objectContaining({
        _id: testGuild.id,
        name: testGuild.name,
        tag: testGuild.tag,
        coatOfArms: testGuild.coatOfArms,
      })
    );
  });

  it("should fetch guild if optional characterId is provided", async () => {
    await guildGet.getGuilds(undefined, testCharacter2, testCharacter._id);

    expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledWith(
      testCharacter2.channelId!,
      GuildSocketEvents.GuildInfoOpen,
      expect.objectContaining({
        _id: testGuild.id,
        name: testGuild.name,
        tag: testGuild.tag,
        coatOfArms: testGuild.coatOfArms,
      })
    );
  });

  it("should send undefine if character is not in a guild", async () => {
    await guildGet.getGuilds(undefined, testCharacter2);

    expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledWith(
      testCharacter2.channelId!,
      GuildSocketEvents.GuildInfoOpen,
      null
    );
  });
});
