import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterWeight } from "../CharacterWeight";

describe("CharacterWeight.ts", () => {
  let testCharacter: ICharacter;
  let characterWeight: CharacterWeight;

  beforeAll(async () => {
    await unitTestHelper.beforeAllJestHook();

    characterWeight = container.get<CharacterWeight>(CharacterWeight);
  });

  beforeEach(async () => {
    testCharacter = await (
      await unitTestHelper.createMockCharacter(null, { hasSkills: true, hasEquipment: true, hasInventory: true })
    )
      .populate("skills")
      .execPopulate();
  });

  it("should properly calculate the character maxWeight", async () => {
    const maxWeight = await characterWeight.getMaxWeight(testCharacter);

    const skills = testCharacter.skills as unknown as ISkill;

    expect(maxWeight).toBe(skills.level * 15);
  });

  it("should properly calculate the character weight", async () => {
    const weight = await characterWeight.getWeight(testCharacter);

    expect(weight).toBe(3);
  });

  afterAll(async () => {
    await unitTestHelper.afterAllJestHook();
  });
});
