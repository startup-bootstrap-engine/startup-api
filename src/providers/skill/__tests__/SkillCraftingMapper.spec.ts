import { container } from "@providers/inversify/container";

import { PotionsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CraftingSkill, ItemType } from "@rpg-engine/shared";
import { SkillCraftingMapper } from "../SkillCraftingMapper";
import { CraftingSkillsMap } from "../constants";

describe("SkillCraftingMapper", () => {
  let skillCraftingMapper: SkillCraftingMapper;

  beforeAll(() => {
    skillCraftingMapper = container.get(SkillCraftingMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should properly get a skill from the CraftingSkillsMap", () => {
    const craftedItemKey = "existingKey";
    CraftingSkillsMap.set(craftedItemKey, "Tailoring");

    const skill = skillCraftingMapper.getCraftingSkillToUpdate(craftedItemKey);

    expect(skill).toBe("Tailoring");
  });

  it("Should get a farming skill when craftedItemKey is plant", () => {
    const craftedItemKey = ItemType.Plant;

    const skill = skillCraftingMapper.getCraftingSkillToUpdate(craftedItemKey);

    expect(skill).toBe(CraftingSkill.Farming);
  });

  it("Should return undefined if skill is not found", () => {
    const craftedItemKey = "nonExistingKey";

    const skill = skillCraftingMapper.getCraftingSkillToUpdate(craftedItemKey);

    expect(skill).toBeUndefined();
  });

  it("should get the skill from minCraftingRequirements, if CraftingSkillsMap is empty", () => {
    const skill = skillCraftingMapper.getCraftingSkillToUpdate(PotionsBlueprint.LifePotion);

    expect(skill).toBe("alchemy");
  });
});
