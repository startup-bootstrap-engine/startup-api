import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { container, unitTestHelper } from "@providers/inversify/container";
import { BasicAttribute, CharacterBuffDurationType, CharacterBuffType } from "@rpg-engine/shared";
import { SkillBuffQueue } from "../SkillBuffQueue";

describe("SkillBuff", () => {
  let characterBuffActivator: CharacterBuffActivator;
  let testCharacter: ICharacter;
  let skillBuff: SkillBuffQueue;
  let inMemoryHashTable: InMemoryHashTable;

  beforeAll(() => {
    characterBuffActivator = container.get(CharacterBuffActivator);
    skillBuff = container.get(SkillBuffQueue);
    inMemoryHashTable = container.get(InMemoryHashTable);
  });

  beforeEach(async () => {
    testCharacter = (await unitTestHelper.createMockCharacter(null, { hasSkills: true })) as ICharacter;
  });

  it("should return skills from cache if available", async () => {
    const cachedSkills = { magic: { level: 5, buffAndDebuff: 10 } };
    jest.spyOn(inMemoryHashTable, "get").mockResolvedValueOnce(cachedSkills);

    const skills = await skillBuff.getSkillsWithBuff(testCharacter);

    expect(skills).toEqual(cachedSkills);
    expect(inMemoryHashTable.get).toHaveBeenCalledWith("skills-with-buff", testCharacter._id);
  });

  it("should fetch skills if not in cache", async () => {
    const fetchedSkills = { magic: { level: 5 } };
    // @ts-ignore
    jest.spyOn(inMemoryHashTable, "get").mockResolvedValueOnce(null);
    // @ts-ignore
    jest.spyOn(skillBuff, "fetchSkills").mockResolvedValueOnce(fetchedSkills);

    const skills = await skillBuff.getSkillsWithBuff(testCharacter);

    expect(skills).toEqual(fetchedSkills);
    // @ts-ignore
    expect(skillBuff.fetchSkills).toHaveBeenCalledWith(testCharacter);
  });

  it("should validate skills and throw an error if not found", async () => {
    // @ts-ignore
    jest.spyOn(skillBuff, "fetchSkills").mockResolvedValueOnce(null);

    await expect(skillBuff.getSkillsWithBuff(testCharacter)).rejects.toThrowError(
      `Skills not found for character ${testCharacter._id.toString()}`
    );
  });

  it("should apply buffs to skills correctly", async () => {
    await characterBuffActivator.enablePermanentBuff(testCharacter, {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
    });

    const skills = await skillBuff.getSkillsWithBuff(testCharacter);

    expect(skills.magic.buffAndDebuff).toBe(10);
  });

  it("should cache skills after applying buffs and bonuses/penalties", async () => {
    const fetchedSkills = { magic: { level: 5, buffAndDebuff: 0 } };
    // @ts-ignore
    jest.spyOn(inMemoryHashTable, "get").mockResolvedValueOnce(null);
    // @ts-ignore
    jest.spyOn(skillBuff, "fetchSkills").mockResolvedValueOnce(fetchedSkills);
    jest.spyOn(inMemoryHashTable, "set").mockResolvedValueOnce();

    const skills = await skillBuff.getSkillsWithBuff(testCharacter);

    expect(inMemoryHashTable.set).toHaveBeenCalledWith("skills-with-buff", testCharacter._id, skills);
  });

  it("should handle fetch skills error", async () => {
    // @ts-ignore
    jest.spyOn(skillBuff, "fetchSkills").mockImplementationOnce(() => {
      throw new Error("Fetch skills error");
    });

    await expect(skillBuff.getSkillsWithBuff(testCharacter)).rejects.toThrow("Fetch skills error");
  });
});
