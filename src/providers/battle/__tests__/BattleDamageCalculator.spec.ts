import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterClass, EntityType } from "@rpg-engine/shared";
import _ from "lodash";
import { BattleDamageCalculator } from "../BattleDamageCalculator";

describe("BattleDamageCalculator.spec.ts", () => {
  let battleDamageCalculator: BattleDamageCalculator;

  let testNPC: INPC;
  let testCharacter: ICharacter;

  beforeAll(() => {
    battleDamageCalculator = container.get<BattleDamageCalculator>(BattleDamageCalculator);

    // Set random as 50 to get the most likely Battle Event
    jest.spyOn(_, "random").mockImplementation(() => 51);
  });

  beforeEach(async () => {
    testNPC = await unitTestHelper.createMockNPC(null, { hasSkills: true });
    await testNPC.populate("skills").execPopulate();
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasSkills: true, hasEquipment: true });
    await testCharacter.populate("skills").execPopulate();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Potential damage calculation", () => {
    it("should properly calculate potential damage", async () => {
      await testNPC.populate("skills").execPopulate();
      await testCharacter.populate("skills").execPopulate();

      // @ts-ignore
      const potentialDamage = await battleDamageCalculator.calculatePhysicalTotalPotentialDamage(
        testCharacter.skills as ISkill,
        testNPC.skills as ISkill,
        undefined
      );

      expect(potentialDamage).toBe(2);
    });

    it("should properly calculate potential damage - influenced by skill level", async () => {
      const skillLvl = 100;
      const characterSkills = await Skill.findById(testCharacter.skills);
      expect(characterSkills).toBeDefined();
      characterSkills!.first.level = skillLvl;
      await characterSkills!.save();

      await testNPC.populate("skills").execPopulate();
      await testCharacter.populate("skills").execPopulate();

      // @ts-ignore
      const potentialDamage = await battleDamageCalculator.calculatePhysicalTotalPotentialDamage(
        testCharacter.skills as ISkill,
        testNPC.skills as ISkill,
        undefined
      );

      expect(potentialDamage).toBe(skillLvl / 2 + 1);
    });
  });

  describe("Core functionality", () => {
    it("should properly calculate a hit damage", async () => {
      await testNPC.populate("skills").execPopulate();
      await testCharacter.populate("skills").execPopulate();

      jest.spyOn(battleDamageCalculator as any, "gaussianRandom").mockImplementation(() => 10);

      const hit = await battleDamageCalculator.calculateHitDamage(testCharacter, testNPC);

      expect(hit).toBeCloseTo(10, 0);
    });

    it("should properly calculate a hit damage with damage reduction", async () => {
      await testNPC.populate("skills").execPopulate();
      await testCharacter.populate("skills").execPopulate();
      const skills = await Skill.findById(testCharacter.skills);

      skills!.level = 25;
      skills!.resistance.level = 25;
      skills!.shielding.level = 30;
      await skills!.save();

      await testCharacter.populate("skills").execPopulate();

      jest.spyOn(battleDamageCalculator as any, "gaussianRandom").mockImplementation(() => 30);

      const hit = await battleDamageCalculator.calculateHitDamage(testNPC, testCharacter);

      expect(hit).toBe(15);
    });

    it("If damage is low and shield lvl high, should not reduce and take the normal damage", async () => {
      await testNPC.populate("skills").execPopulate();
      await testCharacter.populate("skills").execPopulate();
      const skills = await Skill.findById(testCharacter.skills);

      skills!.level = 25;
      skills!.resistance.level = 25;
      skills!.shielding.level = 30;
      await skills!.save();

      await testCharacter.populate("skills").execPopulate();

      jest.spyOn(_, "random").mockImplementation(() => 10);
      jest.spyOn(battleDamageCalculator as any, "gaussianRandom").mockImplementation(() => 10);

      const hit = await battleDamageCalculator.calculateHitDamage(testNPC, testCharacter);

      expect(hit).toBe(5);
    });

    it("hit damage should be less or equal to target's health", async () => {
      await testNPC.populate("skills").execPopulate();
      await testCharacter.populate("skills").execPopulate();

      jest.spyOn(battleDamageCalculator as any, "gaussianRandom").mockImplementation(() => 1000);

      const hit = await battleDamageCalculator.calculateHitDamage(testCharacter, testNPC);

      expect(hit).toBe(testNPC.health);
    });
  });

  describe("Damage reduction", () => {
    let spyCalculateShieldingDefense: jest.SpyInstance;
    let spyCalculateRegularDefense: jest.SpyInstance;
    let spyDamageReduction: jest.SpyInstance;
    let attacker: INPC;
    let defender: ICharacter;
    let defenderSkills: ISkill;

    beforeEach(async () => {
      jest.spyOn(battleDamageCalculator as any, "calculatePhysicalTotalPotentialDamage").mockImplementation(() => 100);

      spyCalculateShieldingDefense = jest.spyOn(battleDamageCalculator as any, "calculateCharacterShieldingDefense");

      spyCalculateRegularDefense = jest.spyOn(battleDamageCalculator as any, "calculateCharacterRegularDefense");

      spyDamageReduction = jest.spyOn(battleDamageCalculator as any, "calculateDamageReduction");

      attacker = await unitTestHelper.createMockNPC(null, { hasSkills: true });

      defender = await unitTestHelper.createMockCharacter(null, { hasSkills: true });

      defenderSkills = (await Skill.findById(defender.skills)) as ISkill;

      defenderSkills.shielding.level = 10;
      defenderSkills.resistance.level = 10;
      defenderSkills.magicResistance.level = 10;

      await defenderSkills.save();

      await defender.populate("skills").execPopulate();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("calculates damage reduction if character has shield", async () => {
      // @ts-ignore
      jest.spyOn(battleDamageCalculator.characterWeapon, "hasShield").mockImplementation(() => true);

      await battleDamageCalculator.calculateHitDamage(attacker, defender, false);

      expect(spyDamageReduction).toHaveBeenCalled();
      expect(spyCalculateShieldingDefense).toHaveBeenCalled();

      expect(spyCalculateShieldingDefense).toHaveBeenCalledWith(
        defenderSkills.level,
        defenderSkills.resistance.level,
        defenderSkills.shielding.level
      );
    });

    it("calculates damage reduction based on magic resistance, if its a magic attack", async () => {
      // @ts-ignore
      jest.spyOn(battleDamageCalculator.characterWeapon, "hasShield").mockImplementation(() => false);

      await battleDamageCalculator.calculateHitDamage(attacker, defender, true);

      expect(spyDamageReduction).toHaveBeenCalled();
      expect(spyCalculateShieldingDefense).not.toHaveBeenCalled();
      expect(spyCalculateRegularDefense).toHaveBeenCalled();

      expect(spyCalculateRegularDefense).toHaveBeenCalledWith(
        defenderSkills.level,
        defenderSkills.magicResistance.level
      );
    });

    it("calculates damage reduction based on resistance only, if no shield is equipped and its not a magic attack", async () => {
      // @ts-ignore
      jest.spyOn(battleDamageCalculator.characterWeapon, "hasShield").mockImplementation(() => false);

      await battleDamageCalculator.calculateHitDamage(attacker, defender, false);

      expect(spyDamageReduction).toHaveBeenCalled();
      expect(spyCalculateShieldingDefense).not.toHaveBeenCalled();
      expect(spyCalculateRegularDefense).toHaveBeenCalled();

      const defenderSkills = defender.skills as ISkill;

      expect(spyCalculateRegularDefense).toHaveBeenCalledWith(defenderSkills.level, defenderSkills.resistance.level);
    });
  });

  describe("Edge cases - Invalid input", () => {
    it("hit damage should always be >= 0", async () => {
      jest.spyOn(battleDamageCalculator as any, "gaussianRandom").mockImplementation(() => 0);

      // @ts-ignore
      jest.spyOn(battleDamageCalculator.skillStatsCalculator, "getAttack").mockImplementation(() => 0);
      // @ts-ignore
      jest.spyOn(battleDamageCalculator.skillStatsCalculator, "getDefense").mockImplementation(() => 0);

      const hit = await battleDamageCalculator.calculateHitDamage(testCharacter, testNPC);

      expect(hit >= 0).toBeTruthy();

      // @ts-ignore
      jest.spyOn(battleDamageCalculator.skillStatsCalculator, "getMagicAttack").mockImplementation(() => 0);
      // @ts-ignore
      jest.spyOn(battleDamageCalculator.skillStatsCalculator, "getMagicDefense").mockImplementation(() => 0);

      const magicHit = await battleDamageCalculator.calculateHitDamage(testCharacter, testNPC);

      expect(magicHit >= 0).toBeTruthy();
    });
  });

  describe("pvp rogue attack damage increase", () => {
    let attacker: ICharacter;
    let defender: ICharacter;

    beforeEach(async () => {
      // @ts-ignore
      jest.spyOn(battleDamageCalculator.characterWeapon, "getWeapon" as any).mockImplementation(() => null);

      jest.spyOn(battleDamageCalculator as any, "calculatePhysicalTotalPotentialDamage").mockImplementation(() => 100);

      jest
        .spyOn(battleDamageCalculator as any, "implementDamageReduction")
        .mockImplementation((defenderSkills, target, damage, isMagicAttack) => damage);

      // @ts-ignore
      jest.spyOn(_, "random").mockImplementation((a, b) => b);

      jest
        .spyOn(battleDamageCalculator as any, "gaussianRandom")
        // @ts-ignore
        .mockImplementation((meanDamage, stdDeviation) => meanDamage + stdDeviation);

      attacker = await unitTestHelper.createMockCharacter(
        {
          class: CharacterClass.Rogue,
          type: EntityType.Character,
        },
        { hasSkills: true }
      );

      defender = await unitTestHelper.createMockCharacter(
        {
          type: EntityType.Character,
          health: 200,
        },
        { hasSkills: true }
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("attack damage should be increased", async () => {
      const damage = await battleDamageCalculator.calculateHitDamage(attacker, defender, false);
      expect(damage).toBe(94);
    });

    it("attack damage should not be increased if attacker is not a Rogue", async () => {
      attacker.class = CharacterClass.Berserker;
      const damage = await battleDamageCalculator.calculateHitDamage(attacker, defender, false);
      expect(damage).toBe(85);
    });

    it("attack damage should not be increased if battle is not pvp", async () => {
      const defenderNPC = await unitTestHelper.createMockNPC(null, { hasSkills: true });

      const damage = await battleDamageCalculator.calculateHitDamage(attacker, defenderNPC, false);
      expect(damage).toBeCloseTo(85);
    });

    describe("BattleDamageCalculator - Edge cases", () => {
      let battleDamageCalculator: BattleDamageCalculator;
      let testCharacter: ICharacter;
      let testNPC: INPC;

      beforeAll(() => {
        battleDamageCalculator = container.get<BattleDamageCalculator>(BattleDamageCalculator);

        // Set random as 50 to get the most likely Battle Event
        jest.spyOn(_, "random").mockImplementation(() => 51);
      });

      beforeEach(async () => {
        testNPC = await unitTestHelper.createMockNPC(null, { hasSkills: true });
        await testNPC.populate("skills").execPopulate();
        testCharacter = await unitTestHelper.createMockCharacter(null, { hasSkills: true, hasEquipment: true });
        await testCharacter.populate("skills").execPopulate();
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it("should return a random damage between 0 and 1 if the weapon is a training weapon", async () => {
        await testCharacter.populate("skills").execPopulate();
        await testNPC.populate("skills").execPopulate();

        const mockWeapon = { item: { isTraining: true } };
        // @ts-ignore
        jest.spyOn(battleDamageCalculator.characterWeapon, "getWeapon").mockResolvedValue(mockWeapon);

        const hit = await battleDamageCalculator.calculateHitDamage(testCharacter, testNPC);

        expect([0, 1]).toContain(hit);
      });

      describe("Magic attack scenarios", () => {
        it("should properly calculate magic attack damage", async () => {
          await testCharacter.populate("skills").execPopulate();
          await testNPC.populate("skills").execPopulate();

          jest.spyOn(battleDamageCalculator as any, "gaussianRandom").mockImplementation(() => 10);

          const hit = await battleDamageCalculator.calculateHitDamage(testCharacter, testNPC, true);

          expect(hit).toBeCloseTo(10, 0);
        });

        it("should properly calculate magic attack damage with damage reduction", async () => {
          await testCharacter.populate("skills").execPopulate();
          await testNPC.populate("skills").execPopulate();
          const skills = await Skill.findById(testCharacter.skills);

          skills!.level = 25;
          skills!.magicResistance.level = 25;
          await skills!.save();

          await testCharacter.populate("skills").execPopulate();

          jest.spyOn(battleDamageCalculator as any, "gaussianRandom").mockImplementation(() => 30);

          const hit = await battleDamageCalculator.calculateHitDamage(testNPC, testCharacter, true);

          expect(hit).toBeCloseTo(15, 1);
        });

        it("should handle critical hits in magic attacks", () => {
          jest.spyOn(_, "random").mockImplementation(() => 0); // Force critical hit
          const hit = battleDamageCalculator.getCriticalHitDamageIfSucceed(10);
          expect(hit).toBe(18);
        });

        it("should calculate magic attack potential damage", async () => {
          // @ts-ignore
          const potentialDamage = await battleDamageCalculator.calculateMagicTotalPotentialDamage(
            testCharacter.skills as ISkill,
            testNPC.skills as ISkill
          );

          expect(potentialDamage).toBeGreaterThan(0);
        });
      });

      describe("Edge cases for damage calculation", () => {
        it("should handle zero attack and defense gracefully", async () => {
          // @ts-ignore
          jest.spyOn(battleDamageCalculator.skillStatsCalculator, "getAttack").mockImplementation(() => 0);
          // @ts-ignore
          jest.spyOn(battleDamageCalculator.skillStatsCalculator, "getDefense").mockImplementation(() => 0);

          const hit = await battleDamageCalculator.calculateHitDamage(testCharacter, testNPC);

          expect(hit).toBe(0);
        });

        it("should handle maximum possible damage", async () => {
          jest.spyOn(battleDamageCalculator as any, "gaussianRandom").mockImplementation(() => 10000);

          const hit = await battleDamageCalculator.calculateHitDamage(testCharacter, testNPC);

          expect(hit).toBe(testNPC.health); // Damage should not exceed target's health
        });

        it("should handle negative damage (should be clamped to minimum)", async () => {
          jest.spyOn(battleDamageCalculator as any, "gaussianRandom").mockImplementation(() => -10);

          const hit = await battleDamageCalculator.calculateHitDamage(testCharacter, testNPC);

          expect(hit).toBe(0);
        });

        it("should not apply damage reduction for NPCs", async () => {
          const defender = await unitTestHelper.createMockNPC(null, { hasSkills: true });
          const attacker = await unitTestHelper.createMockCharacter(null, { hasSkills: true });

          const hit = await battleDamageCalculator.calculateHitDamage(attacker, defender);

          expect(hit).toBeGreaterThan(0);
        });
      });

      describe("PVP scenarios", () => {
        let attacker: ICharacter;
        let defender: ICharacter;

        beforeEach(async () => {
          // @ts-ignore
          jest.spyOn(battleDamageCalculator.characterWeapon, "getWeapon" as any).mockImplementation(() => null);

          jest
            .spyOn(battleDamageCalculator as any, "calculatePhysicalTotalPotentialDamage")
            .mockImplementation(() => 100);

          jest
            .spyOn(battleDamageCalculator as any, "implementDamageReduction")
            .mockImplementation((defenderSkills, target, damage, isMagicAttack) => damage);

          // @ts-ignore
          jest.spyOn(_, "random").mockImplementation((a, b) => b);

          jest
            .spyOn(battleDamageCalculator as any, "gaussianRandom")
            // @ts-ignore
            .mockImplementation((meanDamage, stdDeviation) => meanDamage + stdDeviation);

          attacker = await unitTestHelper.createMockCharacter(
            {
              class: CharacterClass.Rogue,
              type: EntityType.Character,
            },
            { hasSkills: true }
          );

          defender = await unitTestHelper.createMockCharacter(
            {
              type: EntityType.Character,
              health: 200,
            },
            { hasSkills: true }
          );
        });

        it("should increase damage for Rogue in PVP", async () => {
          const damage = await battleDamageCalculator.calculateHitDamage(attacker, defender, false);
          expect(damage).toBe(94);
        });

        it("should not increase damage for non-Rogue in PVP", async () => {
          attacker.class = CharacterClass.Berserker;
          const damage = await battleDamageCalculator.calculateHitDamage(attacker, defender, false);
          expect(damage).toBe(85);
        });

        it("should not increase damage for Rogue against NPC", async () => {
          const defenderNPC = await unitTestHelper.createMockNPC(null, { hasSkills: true });

          const damage = await battleDamageCalculator.calculateHitDamage(attacker, defenderNPC, false);
          expect(damage).toBeCloseTo(85);
        });
      });
    });
  });
});
