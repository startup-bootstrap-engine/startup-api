import { unitTestHelper } from "@providers/inversify/container";
import { calculateSPToNextLevel, calculateXPToNextLevel } from "@rpg-engine/shared";
import { IGuild } from "../GuildModel";
import { ElementalType, GuildSkills, IGuildSkills } from "../GuildSkillsModel";

describe("GuildSkillsModel.ts", () => {
  let testGuild: IGuild;
  let guildSkills: IGuildSkills;

  beforeEach(async () => {
    testGuild = await unitTestHelper.createMockGuild();

    guildSkills = new GuildSkills({
      owner: testGuild._id,
    });

    await guildSkills.save();
    testGuild.guildSkills = guildSkills._id;
    await testGuild.save();
  });

  it("Validate if the record is being created", () => {
    expect(guildSkills).toBeDefined();
    expect(guildSkills.owner).toBe(testGuild._id);
    expect(guildSkills.level).toBe(1);
    expect(guildSkills.guildPoints).toBe(0);
    expect(guildSkills.guildPointsToNextLevel).toBe(calculateSPToNextLevel(0, 2));
    expect(guildSkills.experience).toBe(0);
    expect(guildSkills.xpToNextLevel).toBe(calculateXPToNextLevel(0, 2));

    expect(guildSkills.fireSkill.type).toBe(ElementalType.Fire);
    expect(guildSkills.fireSkill.level).toBe(1);
    expect(guildSkills.fireSkill.skillPoints).toBe(0);
    expect(guildSkills.fireSkill.skillPointsToNextLevel).toBe(calculateSPToNextLevel(0, 2));

    expect(guildSkills.waterSkill.type).toBe(ElementalType.Water);
    expect(guildSkills.waterSkill.level).toBe(1);
    expect(guildSkills.waterSkill.skillPoints).toBe(0);
    expect(guildSkills.waterSkill.skillPointsToNextLevel).toBe(calculateSPToNextLevel(0, 2));

    expect(guildSkills.earthSkill.type).toBe(ElementalType.Earth);
    expect(guildSkills.earthSkill.level).toBe(1);
    expect(guildSkills.earthSkill.skillPoints).toBe(0);
    expect(guildSkills.earthSkill.skillPointsToNextLevel).toBe(calculateSPToNextLevel(0, 2));

    expect(guildSkills.airSkill.type).toBe(ElementalType.Air);
    expect(guildSkills.airSkill.level).toBe(1);
    expect(guildSkills.airSkill.skillPoints).toBe(0);
    expect(guildSkills.airSkill.skillPointsToNextLevel).toBe(calculateSPToNextLevel(0, 2));

    expect(guildSkills.corruptionSkill.type).toBe(ElementalType.Corruption);
    expect(guildSkills.corruptionSkill.level).toBe(1);
    expect(guildSkills.corruptionSkill.skillPoints).toBe(0);
    expect(guildSkills.corruptionSkill.skillPointsToNextLevel).toBe(calculateSPToNextLevel(0, 2));

    expect(guildSkills.natureSkill.type).toBe(ElementalType.Nature);
    expect(guildSkills.natureSkill.level).toBe(1);
    expect(guildSkills.natureSkill.skillPoints).toBe(0);
    expect(guildSkills.natureSkill.skillPointsToNextLevel).toBe(calculateSPToNextLevel(0, 2));
  });
});
