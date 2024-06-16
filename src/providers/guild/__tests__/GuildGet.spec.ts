import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IGuild } from "@entities/ModuleSystem/GuildModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { GuildSocketEvents } from "@rpg-engine/shared";
import { GuildGet } from "../GuildGet";

describe("GuildGet.ts", () => {
  let testGuild: IGuild;
  let testCharacter: ICharacter;
  let testCharacter2: ICharacter;
  let guildGet: GuildGet;

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

    testGuild.members = [testCharacter._id];
    testGuild.guildLeader = testCharacter._id;
    await testGuild.save();

    // @ts-ignore
    guildGet.socketMessaging = mockSocketMessaging;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should fetch and send guild if guildId is provided", async () => {
    await guildGet.getGuilds(testGuild.id, testCharacter);

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

  it("should send undefine if character is not in a guild", async () => {
    await guildGet.getGuilds(undefined, testCharacter2);

    expect(mockSocketMessaging.sendEventToUser).toHaveBeenCalledWith(
      testCharacter2.channelId!,
      GuildSocketEvents.GuildInfoOpen,
      null
    );
  });
});
