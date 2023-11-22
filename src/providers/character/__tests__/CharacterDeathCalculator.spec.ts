import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { IUser } from "@entities/ModuleSystem/UserModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { UserAccountTypes } from "@rpg-engine/shared";
import { CharacterDeathCalculator } from "../CharacterDeathCalculator";
import { CharacterUser } from "../CharacterUser";

describe("CharacterDeathCalculator", () => {
  let testCharacter: ICharacter;
  let characterDeathCalculator: CharacterDeathCalculator;
  beforeAll(() => {
    characterDeathCalculator = container.get(CharacterDeathCalculator);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasUser: true });
  });

  describe("calculateInventoryDropChance", () => {
    it("calculates correctly the drop chances", async () => {
      const dropChance7 = await characterDeathCalculator.calculateInventoryDropChance({
        level: 7,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(dropChance7).toBe(5);

      const dropChance12 = await characterDeathCalculator.calculateInventoryDropChance({
        level: 12,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(dropChance12).toBe(15);

      const dropChance17 = await characterDeathCalculator.calculateInventoryDropChance({
        level: 17,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(dropChance17).toBe(35);
    });

    it("calculates correctly the drop chances for over max thereshold", async () => {
      const dropChance = await characterDeathCalculator.calculateInventoryDropChance({
        level: 50,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(dropChance).toBe(100);
      const dropChance2 = await characterDeathCalculator.calculateInventoryDropChance({
        level: 32,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(dropChance2).toBe(100);
    });
  });

  describe("calculateXPLoss", () => {
    it("calculates correctly the XP loss for level 5", async () => {
      const xpLoss = await characterDeathCalculator.calculateSkillAndXPLossChance({
        level: 5,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(xpLoss).toBe(0);
    });

    it("calculates correctly the XP loss for level 10", async () => {
      const xpLoss = await characterDeathCalculator.calculateSkillAndXPLossChance({
        level: 10,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(xpLoss).toBe(3);
    });

    it("calculates correctly the XP loss for level 18", async () => {
      const xpLoss = await characterDeathCalculator.calculateSkillAndXPLossChance({
        level: 18,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(xpLoss).toBe(8);
    });

    it("calculates correctly the XP loss for level 20", async () => {
      const xpLoss = await characterDeathCalculator.calculateSkillAndXPLossChance({
        level: 20,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(xpLoss).toBe(10);
    });

    it("calculates correctly the XP loss for level 25", async () => {
      const xpLoss = await characterDeathCalculator.calculateSkillAndXPLossChance({
        level: 25,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(xpLoss).toBe(10);
    });
  });

  describe("Premium account", () => {
    let testUser: IUser;
    let characterUser: CharacterUser;
    beforeAll(() => {
      characterUser = container.get(CharacterUser);
    });

    beforeEach(async () => {
      testUser = (await characterUser.findUserByCharacter(testCharacter)) as IUser;

      testUser.accountType = UserAccountTypes.PremiumGold;

      await testUser.save();
    });

    it("only partially reduce inventory drop chance, if its not a golden premium account", async () => {
      testUser.accountType = UserAccountTypes.PremiumBronze;

      await testUser.save();

      const result = await characterDeathCalculator.calculateInventoryDropChance({
        level: 7,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(result).toBe(3.75); // 25% less chance to drop an item
    });

    it("doesn't drop an inventory if user is a golden premium account", async () => {
      const result = await characterDeathCalculator.calculateInventoryDropChance({
        level: 7,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(result).toBe(0);
    });

    it("loses 50% less Skills on death", async () => {
      const result = await characterDeathCalculator.calculateSkillAndXPLossChance({
        level: 20,
        owner: testCharacter._id,
      } as unknown as ISkill);

      expect(result).toBe(5); // Non PA expected loss would be  10
    });
  });
});
