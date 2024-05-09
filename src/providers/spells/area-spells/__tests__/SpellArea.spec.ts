import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { SPELL_AREA_MEDIUM_BLAST_RADIUS } from "@providers/constants/SpellConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { entityEffectBurning } from "@providers/entityEffects/data/blueprints/entityEffectBurning";
import { container, inMemoryHashTable, unitTestHelper } from "@providers/inversify/container";
import { FriendlyNPCsBlueprint, HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { PartyCRUD } from "@providers/party/PartyCRUD";
import { ICharacterParty } from "@providers/party/PartyTypes";
import { AnimationEffectKeys, EntityType, FromGridX, FromGridY, MagicPower, NPCAlignment } from "@rpg-engine/shared";
import { SpellArea } from "../SpellArea";

describe("SpellArea", () => {
  let testCharacter: ICharacter;
  let testCharacterTarget: ICharacter;
  let testNPC: INPC;
  let spellArea: SpellArea;
  let inMemoryHashTable: InMemoryHashTable;
  let partyCRUD: PartyCRUD;

  beforeAll(() => {
    spellArea = container.get(SpellArea);
    inMemoryHashTable = container.get(InMemoryHashTable);
    partyCRUD = container.get(PartyCRUD);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(
      {
        x: FromGridX(1),
        y: FromGridY(1),
      },
      {
        hasSkills: true,
      }
    );
    testCharacterTarget = await unitTestHelper.createMockCharacter(
      {
        x: FromGridX(1),
        y: FromGridY(1),
      },
      {
        hasSkills: true,
      }
    );
    testNPC = await unitTestHelper.createMockNPC(
      {
        x: FromGridX(1),
        y: FromGridY(1),
      },
      {
        hasSkills: true,
      }
    );
    await testNPC.populate("skills").execPopulate();

    await testCharacter.populate("skills").execPopulate();
    await testCharacterTarget.populate("skills").execPopulate();
  });

  describe("Casting", () => {
    it("should properly cast an area spell", async () => {
      // @ts-expect-error
      const hitTargetSpy = jest.spyOn(spellArea.hitTarget, "hit");

      // @ts-expect-error
      const entityEffectSpy = jest.spyOn(spellArea.entityEffectUse, "applyEntityEffects");

      // @ts-expect-error
      const animationEffectSpy = jest.spyOn(spellArea.animationEffect, "sendAnimationEventToXYPosition");

      // place target inside spellAreaGrid
      testNPC.y = FromGridY(1);
      testNPC.x = FromGridX(2);
      testNPC.alignment = "Hostile";
      await testNPC.save();

      await spellArea.cast(testCharacter, testCharacterTarget, MagicPower.High, {
        effectAnimationKey: AnimationEffectKeys.HitFire,
        entityEffect: entityEffectBurning,
        spellAreaGrid: SPELL_AREA_MEDIUM_BLAST_RADIUS,
      });

      expect(hitTargetSpy).toHaveBeenCalled();
      expect(entityEffectSpy).toHaveBeenCalled();
      expect(animationEffectSpy).toHaveBeenCalled();
    });
  });

  describe("Calculations", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return the correct animation cells", async () => {
      const spellAreaOrigin = { x: 2, y: 2 };
      const spellAreaGrid = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];

      // place target inside spellAreaGrid
      testNPC.y = FromGridY(1);
      testNPC.x = FromGridX(2);
      await testNPC.save();

      // @ts-ignore
      const { cells, targets } = await spellArea.calculateEffect(testCharacter, spellAreaOrigin, spellAreaGrid);

      expect(targets).toHaveLength(1);
      expect(targets[0].intensity).toEqual(1);
      const affectedNPC = targets[0].target as unknown as INPC;
      expect(affectedNPC.id).toEqual(testNPC.id);

      expect(cells).toEqual([
        { x: 2, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 2, y: 3 },
      ]);
    });

    it("should return the correct animation cells - big grid & with intensity", async () => {
      const spellAreaOrigin = { x: 4, y: 4 };
      const spellAreaGrid = [
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 2, 1, 0, 0],
        [0, 1, 2, 3, 2, 1, 0],
        [1, 2, 3, 4, 3, 2, 1],
        [0, 1, 2, 3, 2, 1, 0],
        [0, 0, 1, 2, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
      ];

      // place caster inside the spellAreaGrid
      // should not be returned in affected targets
      testCharacter.y = FromGridY(4);
      testCharacter.x = FromGridX(4);
      await testCharacter.save();

      // place targets inside spellAreaGrid
      testNPC.y = FromGridY(4);
      testNPC.x = FromGridX(3);
      await testNPC.save();

      testCharacterTarget.y = FromGridY(5);
      testCharacterTarget.x = FromGridX(5);
      await testCharacterTarget.save();

      // @ts-ignore
      const { cells, targets } = await spellArea.calculateEffect(testCharacter, spellAreaOrigin, spellAreaGrid);

      expect(targets).toHaveLength(2);
      expect(targets[0].intensity).toEqual(3);
      expect(targets[1].intensity).toEqual(2);

      const affectedNPC = targets[0].target as unknown as INPC;
      expect(affectedNPC.id).toEqual(testNPC.id);

      const affectedChar = targets[1].target as unknown as ICharacter;
      expect(affectedChar.id).toEqual(testCharacterTarget.id);

      expect(cells).toEqual([
        { x: 4, y: 1 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 5, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 4, y: 3 },
        { x: 5, y: 3 },
        { x: 6, y: 3 },
        { x: 1, y: 4 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
        { x: 4, y: 4 },
        { x: 5, y: 4 },
        { x: 6, y: 4 },
        { x: 7, y: 4 },
        { x: 2, y: 5 },
        { x: 3, y: 5 },
        { x: 4, y: 5 },
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 3, y: 6 },
        { x: 4, y: 6 },
        { x: 5, y: 6 },
        { x: 4, y: 7 },
      ]);
    });

    it("should return an empty array for an empty spell area grid", async () => {
      const spellAreaOrigin = { x: 1, y: 1 };
      const spellAreaGrid: number[][] = [[]];

      // @ts-ignore
      const { cells, targets } = await spellArea.calculateEffect(testCharacter, spellAreaOrigin, spellAreaGrid);

      // Expected animation cells: []
      expect(cells).toEqual([]);
      expect(targets).toHaveLength(0);
    });

    it("should return the spell area origin for a single-cell spell area grid", async () => {
      const spellAreaOrigin = { x: 0, y: 0 };
      const spellAreaGrid = [[1]];

      // @ts-ignore
      const { cells, targets } = await spellArea.calculateEffect(testCharacter, spellAreaOrigin, spellAreaGrid);

      expect(cells).toEqual([{ x: 0, y: 0 }]);
      expect(targets).toHaveLength(0);
    });
  });
});

describe("SpellArea - Validations", () => {
  let testNPC: INPC;
  let hitTargetSpy: jest.SpyInstance;
  let testCharacter: ICharacter;
  let skullGainSpy: jest.SpyInstance;
  let spellArea: SpellArea;

  const testSpellAreaOptions = {
    effectAnimationKey: AnimationEffectKeys.HitFire,
    entityEffect: entityEffectBurning,
    spellAreaGrid: SPELL_AREA_MEDIUM_BLAST_RADIUS,
  };

  beforeAll(() => {
    spellArea = container.get(SpellArea);
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    testNPC = await unitTestHelper.createMockNPC(
      {
        key: HostileNPCsBlueprint.OrcMage,
        x: FromGridX(0),
        y: FromGridX(0),
      },
      { hasSkills: true }
    );

    // @ts-ignore
    hitTargetSpy = jest.spyOn(spellArea.hitTarget, "hit");

    testCharacter = await unitTestHelper.createMockCharacter(null, { hasSkills: true });
  });

  it("when an NPC cast area spell into another NPC, it should not be hit", async () => {
    const testNPC2 = await unitTestHelper.createMockNPC(
      {
        key: HostileNPCsBlueprint.Orc,
        x: FromGridX(1),
        y: FromGridX(1),
      },
      { hasSkills: true }
    );

    await spellArea.cast(testNPC, testNPC2, MagicPower.High, testSpellAreaOptions);

    expect(hitTargetSpy).not.toHaveBeenCalled();
  });

  it("character should NOT gain a Skull if throwing a support spell in a NPC or another character", async () => {
    // @ts-ignore
    skullGainSpy = jest.spyOn(spellArea, "handleSkullGain");

    const result = await spellArea.cast(testCharacter, testNPC, MagicPower.High, {
      effectAnimationKey: AnimationEffectKeys.Heal,
      spellAreaGrid: SPELL_AREA_MEDIUM_BLAST_RADIUS,
      includeCaster: true,
      isAttackSpell: false,
      excludeEntityTypes: [EntityType.NPC],
      customFn: async (target: ICharacter | INPC) => {},
    });

    expect(result).toBe(undefined);

    expect(skullGainSpy).not.toHaveBeenCalled();
  });

  it("character should GAIN a Skull if throwing a attack spell in another character", async () => {
    // @ts-ignore
    skullGainSpy = jest.spyOn(spellArea, "handleSkullGain");

    const testAnotherCharacter = await unitTestHelper.createMockCharacter(
      {
        x: FromGridX(1),
        y: FromGridY(1),
      },
      { hasSkills: true }
    );

    await Skill.updateOne({ owner: testCharacter._id }, { $set: { level: 20 } });
    await Skill.updateOne({ owner: testAnotherCharacter._id }, { $set: { level: 20 } });

    const result = await spellArea.cast(testCharacter, testAnotherCharacter, MagicPower.High, testSpellAreaOptions);

    expect(result).toBe(undefined);

    expect(skullGainSpy).toHaveBeenCalled();

    const returnValue = await skullGainSpy.mock.results[0].value;
    expect(returnValue).toBe(true);
  });

  it("characters should not hit friendly NPCs", async () => {
    const testFriendlyNPC = await unitTestHelper.createMockNPC(
      {
        alignment: NPCAlignment.Friendly,
        key: FriendlyNPCsBlueprint.Agatha,
        x: FromGridX(1),
        y: FromGridX(1),
      },
      { hasSkills: true }
    );

    const result = await spellArea.cast(testCharacter, testFriendlyNPC, MagicPower.High, testSpellAreaOptions);

    expect(result).toBe(undefined);
  });
});

describe("SpellArea - PVP", () => {
  let testCharacter: ICharacter;
  let testAnotherCharacter: ICharacter;
  let testAnotherCharacter2: ICharacter;
  let isSamePartySpy: jest.SpyInstance;
  let spellArea: SpellArea;
  let partyCRUD: PartyCRUD;

  const testSpellAreaOptions = {
    effectAnimationKey: AnimationEffectKeys.HitFire,
    entityEffect: entityEffectBurning,
    spellAreaGrid: SPELL_AREA_MEDIUM_BLAST_RADIUS,
  };

  beforeAll(() => {
    spellArea = container.get(SpellArea);
    partyCRUD = container.get(PartyCRUD);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(
      {
        x: FromGridX(1),
        y: FromGridY(1),
      },
      { hasSkills: true }
    );
    testAnotherCharacter = await unitTestHelper.createMockCharacter(
      {
        x: FromGridX(2),
        y: FromGridY(2),
      },
      { hasSkills: true }
    );
    testAnotherCharacter2 = await unitTestHelper.createMockCharacter(
      {
        x: FromGridX(3),
        y: FromGridY(3),
      },
      { hasSkills: true }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should block a NonPVP zone attack", async () => {
    // @ts-ignore
    jest.spyOn(spellArea.mapNonPVPZone, "isNonPVPZoneAtXY").mockReturnValue(true);

    const result = await spellArea.cast(testCharacter, testAnotherCharacter, MagicPower.High, {
      ...testSpellAreaOptions,
      noCastInNonPvPZone: true,
    });

    expect(result).toBe(undefined);
  });

  it("If the level is lower than PVP_MIN_REQUIRED_LV, it avoids the attack", async () => {
    const result = await spellArea.cast(testCharacter, testAnotherCharacter, MagicPower.High, testSpellAreaOptions);

    expect(result).toBe(undefined);
  });

  it("should prevent a character from attacking another one that's on the same party", async () => {
    // @ts-ignore
    isSamePartySpy = jest.spyOn(spellArea.partyValidator, "checkIfCharacterAndTargetOnTheSameParty");

    // const party = new CharacterParty({
    //   leader: {
    //     _id: testCharacter._id,
    //     class: CharacterClass.Druid,
    //     name: "Test Character",
    //   },
    //   members: [
    //     {
    //       _id: testAnotherCharacter._id,
    //       class: CharacterClass.Berserker,
    //       name: "Test Another Character",
    //     },
    //     {
    //       _id: testAnotherCharacter2._id,
    //       class: CharacterClass.Berserker,
    //       name: "Test Another Character 2",
    //     },
    //   ],
    //   maxSize: 2,
    //   benefits: [],
    // });
    // await party.save();

    const party = (await partyCRUD.createParty(testCharacter, testAnotherCharacter, 2)) as ICharacterParty;

    //! Ideally, party members should be fully stored on redis. Meanwhile, this ugly hack is necessary.
    await inMemoryHashTable.set("party-members", party._id.toString(), [testCharacter._id, testAnotherCharacter._id]);

    const result = await spellArea.cast(testCharacter, testAnotherCharacter, MagicPower.High, testSpellAreaOptions);

    expect(result).toBe(undefined);

    expect(isSamePartySpy).toHaveBeenCalled();
    const returnValue = await isSamePartySpy.mock.results[0].value;
    expect(returnValue).toBe(true);
  });
  it("should NOT prevent a character from attacking another one if they're not on the same party", async () => {
    // @ts-ignore
    isSamePartySpy = jest.spyOn(spellArea.partyValidator, "checkIfCharacterAndTargetOnTheSameParty");

    // const party1 = new CharacterParty({
    //   leader: {
    //     _id: testCharacter._id,
    //     class: CharacterClass.Druid,
    //     name: "Test Character",
    //   },
    //   members: [],
    //   maxSize: 2,
    //   benefits: [],
    // });
    // await party1.save();

    // const party2 = new CharacterParty({
    //   leader: {
    //     _id: testAnotherCharacter._id,
    //     class: CharacterClass.Berserker,
    //     name: "Test Another Character",
    //   },
    //   members: [
    //     {
    //       _id: testAnotherCharacter2._id,
    //       class: CharacterClass.Berserker,
    //       name: "Test Another Character 2",
    //     },
    //   ],
    //   maxSize: 2,
    //   benefits: [],
    // });
    // await party2.save();

    await partyCRUD.createParty(testCharacter, testAnotherCharacter, 2);
    await partyCRUD.createParty(testAnotherCharacter, testAnotherCharacter2, 2);

    await spellArea.cast(testCharacter, testAnotherCharacter, MagicPower.High, testSpellAreaOptions);

    expect(isSamePartySpy).toHaveBeenCalled();
    const returnValue = await isSamePartySpy.mock.results[0].value;
    expect(returnValue).toBe(false);
  });
});
