import { unitTestHelper } from "@providers/inversify/container";
import { guildMock } from "@providers/unitTests/mock/guildMock";
import { IGuild } from "../GuildModel";

describe("GuildModel.ts", () => {
  let testGuild: IGuild;

  beforeEach(async () => {
    testGuild = await unitTestHelper.createMockGuild();
  });

  it("Validate if the record is being created", () => {
    const guild = guildMock;

    expect(testGuild).toBeDefined();
    expect(testGuild.name).toEqual(guild.name);
    expect(testGuild.tag).toEqual(guild.tag);
    expect(testGuild.coatOfArms).toEqual(guild.coatOfArms);
    // @ts-ignore
    expect(testGuild.guildLeader.toString()).toEqual(guild.guildLeader);
    // @ts-ignore
    expect(testGuild.territoriesOwned.length).toBe(guild.territoriesOwned.length);
    // @ts-ignore
    expect(testGuild.members.length).toBe(guild.members.length);
    // @ts-ignore
    expect(testGuild.members[0]).toEqual(guild.members[0]);
    // @ts-ignore
    expect(testGuild.territoriesOwned[0].map).toEqual(guild.territoriesOwned[0].map);
    // @ts-ignore
    expect(testGuild.territoriesOwned[0].lootShare).toEqual(guild.territoriesOwned[0].lootShare);
    // @ts-ignore
    expect(testGuild.territoriesOwned[0].controlPoint).toEqual(guild.territoriesOwned[0].controlPoint);
  });
});
