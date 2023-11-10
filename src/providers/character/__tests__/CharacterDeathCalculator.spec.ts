import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterDeathCalculator } from "../CharacterDeathCalculator";

describe("await characterDeathCalculator", () => {
  let testCharacter: ICharacter;
  let characterDeathCalculator: CharacterDeathCalculator;
  beforeAll(() => {
    characterDeathCalculator = container.get(CharacterDeathCalculator);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();
  });

  describe("calculateInventoryDropChance", () => {
    it("calculates correctly the drop chances", async () => {
      const dropChance7 = await characterDeathCalculator.calculateInventoryDropChance(testCharacter, {
        level: 7,
      } as unknown as ISkill);

      expect(dropChance7).toBe(5);

      const dropChance12 = await characterDeathCalculator.calculateInventoryDropChance(testCharacter, {
        level: 12,
      } as unknown as ISkill);

      expect(dropChance12).toBe(15);

      const dropChance17 = await characterDeathCalculator.calculateInventoryDropChance(testCharacter, {
        level: 17,
      } as unknown as ISkill);

      expect(dropChance17).toBe(35);
    });

    it("calculates correctly the drop chances for over max thereshold", async () => {
      const dropChance = await characterDeathCalculator.calculateInventoryDropChance(testCharacter, {
        level: 50,
      } as unknown as ISkill);

      expect(dropChance).toBe(100);
      const dropChance2 = await characterDeathCalculator.calculateInventoryDropChance(testCharacter, {
        level: 32,
      } as unknown as ISkill);

      expect(dropChance2).toBe(100);
    });
  });

  describe("calculateXPLoss", () => {
    it("calculates correctly the XP loss for level 5", async () => {
      const xpLoss = await characterDeathCalculator.calculateSkillLoss({
        level: 5,
      } as unknown as ISkill);

      expect(xpLoss).toBe(0);
    });

    it("calculates correctly the XP loss for level 10", async () => {
      const xpLoss = await characterDeathCalculator.calculateSkillLoss({
        level: 10,
      } as unknown as ISkill);

      expect(xpLoss).toBe(3);
    });

    it("calculates correctly the XP loss for level 18", async () => {
      const xpLoss = await characterDeathCalculator.calculateSkillLoss({
        level: 18,
      } as unknown as ISkill);

      expect(xpLoss).toBe(8);
    });

    it("calculates correctly the XP loss for level 20", async () => {
      const xpLoss = await characterDeathCalculator.calculateSkillLoss({
        level: 20,
      } as unknown as ISkill);

      expect(xpLoss).toBe(10);
    });

    it("calculates correctly the XP loss for level 25", async () => {
      const xpLoss = await characterDeathCalculator.calculateSkillLoss({
        level: 25,
      } as unknown as ISkill);

      expect(xpLoss).toBe(10);
    });
  });

  describe("Premium account", () => {
    let testCharacter: ICharacter;

    beforeEach(async () => {
      testCharacter = await unitTestHelper.createMockCharacter(null, { isPremiumAccount: true });
    });

    it("doesn't drop an inventory if user is a premium account", async () => {
      const result = await characterDeathCalculator.calculateInventoryDropChance(testCharacter, {
        level: 7,
      } as unknown as ISkill);

      expect(result).toBe(0);
    });
  });
});
