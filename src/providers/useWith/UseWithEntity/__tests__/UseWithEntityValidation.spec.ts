import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { blueprintManager, container, unitTestHelper } from "@providers/inversify/container";
import { IMagicItemUseWithEntity } from "@providers/useWith/useWithTypes";
import { EntityType, MagicsBlueprint } from "@rpg-engine/shared";
import { UseWithEntityValidation } from "../UseWithEntityValidation";

describe("UseWithEntityValidation", () => {
  let useWithEntityValidation: UseWithEntityValidation;
  let testCharacter: ICharacter;
  let testNPC: INPC;
  let testItem: IItem;
  let testItemBlueprint: IMagicItemUseWithEntity;

  beforeAll(() => {
    useWithEntityValidation = container.get(UseWithEntityValidation);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter({ hasSkills: true });
    testNPC = await unitTestHelper.createMockNPC();

    testItem = await unitTestHelper.createMockItemFromBlueprint(MagicsBlueprint.HealRune);

    testItemBlueprint = await blueprintManager.getBlueprint<IMagicItemUseWithEntity>("items", testItem.baseKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("Base validation", () => {
    it("triggers an error if you're trying to use an item that doesn't exist", () => {
      const result = useWithEntityValidation.baseValidation(
        testCharacter,
        null as unknown as IItem,
        testItemBlueprint,
        "Item"
      );

      expect(result).toBe(false);
    });

    it("triggers an error if the blueprint doesn't exist", () => {
      const result = useWithEntityValidation.baseValidation(testCharacter, testItem, null as any, "Item");

      expect(result).toBe(false);
    });

    it("triggers an error if the blueprint has no power and the target type is not StaticEntity", () => {
      const result = useWithEntityValidation.baseValidation(
        testCharacter,
        testItem,
        { ...testItemBlueprint, power: undefined } as unknown as IMagicItemUseWithEntity,
        undefined as any
      );

      expect(result).toBe(false);
    });

    it("triggers an error if the character does not pass basic validation", () => {
      // @ts-ignore
      jest.spyOn(useWithEntityValidation.characterValidation, "hasBasicValidation").mockReturnValue(false);

      const result = useWithEntityValidation.baseValidation(testCharacter, testItem, testItemBlueprint, "Item");

      expect(result).toBe(false);
    });

    it("returns true when all validations pass", () => {
      const result = useWithEntityValidation.baseValidation(testCharacter, testItem, testItemBlueprint, "Item");

      expect(result).toBe(true);
    });
  });

  describe("Target validation", () => {
    it("returns false when the target is not found", async () => {
      const result = await useWithEntityValidation.validateTargetRequest(
        testCharacter,
        null, // no target
        testItem,
        testItemBlueprint,
        "Item"
      );
      expect(result).toBe(false);
    });

    it("returns false when the target is not in the same scene as the caster", async () => {
      testNPC.scene = "DifferentScene"; // Assume 'testCharacter.scene' is "Scene1"
      const result = await useWithEntityValidation.validateTargetRequest(
        testCharacter,
        testNPC, // NPC is in a different scene
        testItem,
        testItemBlueprint,
        "Item"
      );
      expect(result).toBe(false);
    });

    it("returns false when using Heal Rune on an NPC", async () => {
      const healRuneBlueprint = {
        ...testItemBlueprint,
        key: MagicsBlueprint.HealRune,
        name: "Heal Rune",
      } as IMagicItemUseWithEntity;
      testNPC.type = EntityType.NPC;
      const result = await useWithEntityValidation.validateTargetRequest(
        testCharacter,
        testNPC,
        testItem,
        healRuneBlueprint,
        EntityType.NPC
      );
      expect(result).toBe(false);
    });

    it("returns false when the target is invisible", async () => {
      // @ts-ignore
      jest.spyOn(useWithEntityValidation.specialEffect, "isInvisible").mockResolvedValueOnce(true);
      const result = await useWithEntityValidation.validateTargetRequest(
        testCharacter,
        testCharacter, // Assume the target character is the caster
        testItem,
        testItemBlueprint,
        EntityType.Character
      );
      expect(result).toBe(false);
    });
  });
});
