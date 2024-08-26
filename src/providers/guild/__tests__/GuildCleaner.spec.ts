import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { GUILD_INACTIVITY_THRESHOLD_DAYS } from "@providers/constants/GuildConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import dayjs from "dayjs";
import { GuildCleaner } from "../GuildCleaner"; // Adjust the path according to your project structure

describe("GuildCleaner.ts", () => {
  let guildCleaner: GuildCleaner;
  let testGuild: IGuild;
  let activeMember: ICharacter;
  let inactiveMember: ICharacter;

  beforeAll(() => {
    guildCleaner = container.get(GuildCleaner);
  });

  beforeEach(async () => {
    // Create mock characters with valid dates
    activeMember = await unitTestHelper.createMockCharacter({
      lastDayPlayed: dayjs()
        .subtract(GUILD_INACTIVITY_THRESHOLD_DAYS - 1, "day")
        .toDate(),
    });

    inactiveMember = await unitTestHelper.createMockCharacter({
      lastDayPlayed: dayjs()
        .subtract(GUILD_INACTIVITY_THRESHOLD_DAYS + 1, "day")
        .toDate(),
    });

    // Create mock guild
    testGuild = await unitTestHelper.createMockGuild({
      members: [activeMember._id.toString(), inactiveMember._id.toString()],
    });
  });

  afterEach(async () => {
    // Cleanup after each test
    await Character.deleteMany({});
    await Guild.deleteMany({});
  });

  it("should remove inactive members from the guild", async () => {
    // Run the guild cleaner
    await guildCleaner.removeInactiveMembersFromGuild(testGuild);

    // Fetch the updated guild
    const updatedGuild = await Guild.findById(testGuild._id).lean<IGuild>();

    // Ensure the inactive member was removed
    expect(updatedGuild?.members.map((id) => id.toString())).not.toContain(inactiveMember._id.toString());
    // Ensure the active member was not removed
    expect(updatedGuild?.members.map((id) => id.toString())).toContain(activeMember._id.toString());
  });

  it("should not remove any members if all are active", async () => {
    // Update inactiveMember to be active
    await Character.updateOne(
      { _id: inactiveMember._id },
      {
        $set: {
          lastDayPlayed: dayjs()
            .subtract(GUILD_INACTIVITY_THRESHOLD_DAYS - 1, "day")
            .toDate(),
        },
      }
    );

    // Run the guild cleaner
    await guildCleaner.removeInactiveMembersFromGuild(testGuild);

    // Fetch the updated guild
    const updatedGuild = await Guild.findById(testGuild._id).lean<IGuild>();

    // Ensure no members were removed
    expect(updatedGuild?.members.map((id) => id.toString())).toContain(inactiveMember._id.toString());
    expect(updatedGuild?.members.map((id) => id.toString())).toContain(activeMember._id.toString());
  });

  it("should handle case where there are no members in the guild", async () => {
    // Create a guild with no members
    const emptyGuild = await unitTestHelper.createMockGuild({
      members: [],
    });

    // Run the guild cleaner
    await guildCleaner.removeInactiveMembersFromGuild(emptyGuild);

    // Fetch the updated guild
    const updatedGuild = await Guild.findById(emptyGuild._id).lean<IGuild>();

    // Ensure no members were added/removed
    expect(updatedGuild?.members.length).toBe(0);
  });

  it("should not throw an error if a member does not have a lastDayPlayed date", async () => {
    // Create a member with no lastDayPlayed date
    const noLastDayPlayedMember = await unitTestHelper.createMockCharacter({
      lastDayPlayed: undefined,
    });

    // Add this member to the guild
    await Guild.updateOne({ _id: testGuild._id }, { $push: { members: noLastDayPlayedMember._id.toString() } });

    // Run the guild cleaner
    await guildCleaner.removeInactiveMembersFromGuild(testGuild);

    // Fetch the updated guild
    const updatedGuild = await Guild.findById(testGuild._id).lean<IGuild>();

    expect(updatedGuild?.members).not.toContain(noLastDayPlayedMember._id);
  });
});
