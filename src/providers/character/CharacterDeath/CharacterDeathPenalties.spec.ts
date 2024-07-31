/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-unused-vars */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment } from "@entities/ModuleCharacter/EquipmentModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { EquipmentSlots } from "@providers/equipment/EquipmentSlots";
import { container, unitTestHelper } from "@providers/inversify/container";
import { AccessoriesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { CharacterSkullType, Modes, NPCCustomDeathPenalties } from "@rpg-engine/shared";
import { CharacterDeathPenalties } from "../CharacterDeath/CharacterDeathPenalties";

jest.mock("@providers/constants/DeathConstants", () => ({
  DROP_EQUIPMENT_CHANCE: 15,
}));

jest.useFakeTimers({
  advanceTimers: true,
});

describe("CharacterDeathPenalties.ts", () => {
  let characterDeathPenalties: CharacterDeathPenalties;
  let testCharacter: ICharacter;
  let testNPC: INPC;
  let testCharacterBody: IItem;

  const createCharacterAndBody = async (characterConfig: Partial<ICharacter>) => {
    testCharacter = await unitTestHelper.createMockCharacter(characterConfig, {
      hasEquipment: true,
      hasSkills: true,
    });
    testCharacterBody = await unitTestHelper.createMockCharacterDeadBody(testCharacter);
  };

  beforeAll(() => {
    characterDeathPenalties = container.get<CharacterDeathPenalties>(CharacterDeathPenalties);
  });

  describe("Character modes", () => {
    describe("Soft mode", () => {
      beforeEach(async () => {
        await createCharacterAndBody({ mode: Modes.SoftMode });
      });

      it("should not apply penalties for character on soft mode", async () => {
        // @ts-ignore
        const spyDropCharacterItemsOnBody = jest.spyOn(characterDeathPenalties, "dropCharacterItemsOnBody");

        await characterDeathPenalties.applyPenalties(testCharacter, testCharacterBody);

        expect(spyDropCharacterItemsOnBody).not.toHaveBeenCalled();
      });
    });

    describe("Soft mode with skull penalty", () => {
      beforeEach(async () => {
        await createCharacterAndBody({
          mode: Modes.SoftMode,
          hasSkull: true,
          skullType: CharacterSkullType.WhiteSkull,
        });
      });

      it("should apply penalties for character even on soft mode", async () => {
        // @ts-ignore
        const spyDropCharacterItemsOnBody = jest.spyOn(characterDeathPenalties, "dropCharacterItemsOnBody");

        await characterDeathPenalties.applyPenalties(testCharacter, testCharacterBody);

        expect(spyDropCharacterItemsOnBody).toHaveBeenCalled();
      });
    });

    describe("Permadeath Mode", () => {
      beforeEach(async () => {
        await createCharacterAndBody({ mode: Modes.PermadeathMode, isSoftDeleted: false });
      });

      it("should enable isSoftDelete on a character playing on permadeath mode, after death, and drop all loot", async () => {
        const spyOnPermaDeathTrigger = jest.spyOn(characterDeathPenalties, "softDeleteCharacterOnPermaDeathMode");

        await characterDeathPenalties.softDeleteCharacterOnPermaDeathMode(testCharacter);

        const postDeathCharacter = await Character.findById(testCharacter._id).lean();
        if (!postDeathCharacter) throw new Error("Character not found");

        expect(spyOnPermaDeathTrigger).toHaveBeenCalled();
        expect(postDeathCharacter.isSoftDeleted).toBeTruthy();
      });
    });

    describe("Hardcore mode", () => {
      beforeEach(async () => {
        await createCharacterAndBody({ mode: Modes.HardcoreMode });
      });

      it("should apply penalties for character on hardcore mode", async () => {
        // @ts-ignore
        const spyDropCharacterItemsOnBody = jest.spyOn(characterDeathPenalties, "dropCharacterItemsOnBody");

        await characterDeathPenalties.applyPenalties(testCharacter, testCharacterBody);

        expect(spyDropCharacterItemsOnBody).toHaveBeenCalled();
      });
    });
  });

  describe("hasCustomDeathPenalty", () => {
    beforeEach(async () => {
      await createCharacterAndBody({ mode: Modes.HardcoreMode });
      testNPC = await unitTestHelper.createMockNPC();
    });

    it("should apply hardcore penalty if NPC hasCustomDeathPenalty is set to hardcore", async () => {
      testNPC.hasCustomDeathPenalty = NPCCustomDeathPenalties.Hardcore;
      await testNPC.save();

      // @ts-ignore
      const spyDropCharacterItemsOnBody = jest.spyOn(characterDeathPenalties, "dropCharacterItemsOnBody");
      const spyPenalties = jest.spyOn(characterDeathPenalties, "applyPenalties");

      await characterDeathPenalties.applyPenalties(testCharacter, testCharacterBody);

      expect(spyDropCharacterItemsOnBody).toHaveBeenCalled();
      expect(spyPenalties).toHaveBeenCalled();
    });

    it("should apply FULL LOOT DROP penalty if NPC hasCustomDeathPenalty is set to full loot drop", async () => {
      testNPC.hasCustomDeathPenalty = NPCCustomDeathPenalties.FullLootDrop;
      await testNPC.save();

      // @ts-ignore
      const spyDropCharacterItemsOnBody = jest.spyOn(characterDeathPenalties, "dropCharacterItemsOnBody");

      await characterDeathPenalties.applyPenalties(testCharacter, testCharacterBody);

      expect(spyDropCharacterItemsOnBody).toHaveBeenCalled();
    });
  });

  const equipAmuletOfDeath = async (): Promise<void> => {
    const amuletOfDeath = await unitTestHelper.createMockItemFromBlueprint(AccessoriesBlueprint.AmuletOfDeath);
    const equipment = await Equipment.findById(testCharacter.equipment);
    if (!equipment) throw new Error("Equipment not found");
    equipment.neck = amuletOfDeath._id;
    await equipment.save();
  };

  describe("Amulet of Death", () => {
    let dropCharacterItemsOnBodySpy: jest.SpyInstance;
    let skillDecreaseSpy: jest.SpyInstance;
    let removeItemFromSlotSpy: jest.SpyInstance;

    beforeEach(async () => {
      jest.clearAllMocks();

      testNPC = await unitTestHelper.createMockNPC();
      // @ts-ignore
      dropCharacterItemsOnBodySpy = jest.spyOn(characterDeathPenalties, "dropCharacterItemsOnBody");
      // @ts-ignore
      skillDecreaseSpy = jest.spyOn(characterDeathPenalties.skillDecrease, "deathPenalty");
      removeItemFromSlotSpy = jest.spyOn(EquipmentSlots.prototype, "removeItemFromSlot");

      await createCharacterAndBody({ mode: Modes.HardcoreMode });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should protect against item drops and skill/XP loss when Amulet of Death is equipped", async () => {
      await equipAmuletOfDeath();
      await characterDeathPenalties.applyPenalties(testCharacter, testCharacterBody);

      expect(dropCharacterItemsOnBodySpy).not.toHaveBeenCalled();
      expect(skillDecreaseSpy).not.toHaveBeenCalled();
      expect(removeItemFromSlotSpy).toHaveBeenCalledWith(testCharacter, AccessoriesBlueprint.AmuletOfDeath, "neck");
    });

    it("should not protect if Amulet of Death is not in the neck slot", async () => {
      const amuletOfDeath = await unitTestHelper.createMockItemFromBlueprint(AccessoriesBlueprint.AmuletOfDeath);
      const equipment = await Equipment.findById(testCharacter.equipment);
      if (!equipment) throw new Error("Equipment not found");
      equipment.ring = amuletOfDeath._id; // Equip in wrong slot
      await equipment.save();

      await characterDeathPenalties.applyPenalties(testCharacter, testCharacterBody);

      expect(dropCharacterItemsOnBodySpy).toHaveBeenCalled();
      expect(skillDecreaseSpy).toHaveBeenCalled();
    });

    it("should protect against forceDropAll even with Amulet of Death", async () => {
      await equipAmuletOfDeath();

      const mockBody = await unitTestHelper.createMockCharacterDeadBody(testCharacter);

      await characterDeathPenalties.applyPenalties(testCharacter, mockBody, true);

      expect(dropCharacterItemsOnBodySpy).not.toHaveBeenCalled();
      expect(skillDecreaseSpy).not.toHaveBeenCalled();
    });

    it("should protect in Hardcore mode", async () => {
      testCharacter.mode = Modes.HardcoreMode;
      await testCharacter.save();
      await equipAmuletOfDeath();

      await characterDeathPenalties.applyPenalties(testCharacter, testCharacterBody);

      expect(dropCharacterItemsOnBodySpy).not.toHaveBeenCalled();
      expect(skillDecreaseSpy).not.toHaveBeenCalled();
    });

    it("should not protect in Permadeath mode", async () => {
      testCharacter.mode = Modes.PermadeathMode;
      await testCharacter.save();
      await equipAmuletOfDeath();

      await characterDeathPenalties.applyPenalties(testCharacter, testCharacterBody);

      expect(dropCharacterItemsOnBodySpy).toHaveBeenCalled();
    });

    it("should protect against custom NPC death penalties", async () => {
      await equipAmuletOfDeath();
      testNPC.hasCustomDeathPenalty = NPCCustomDeathPenalties.Hardcore;
      await testNPC.save();

      await characterDeathPenalties.applyPenalties(testCharacter, testCharacterBody);

      expect(dropCharacterItemsOnBodySpy).not.toHaveBeenCalled();
      expect(skillDecreaseSpy).not.toHaveBeenCalled();
    });

    it("should not drop any items if the character has an Amulet of Death, but the amulet should be removed", async () => {
      await equipAmuletOfDeath();

      await characterDeathPenalties.applyPenalties(testCharacter, testCharacterBody);

      expect(dropCharacterItemsOnBodySpy).not.toHaveBeenCalled();

      const equipment = await Equipment.findById(testCharacter.equipment);
      if (!equipment) throw new Error("Equipment not found");
      expect(equipment.neck).toBeFalsy();
    });

    it("should drop items if the character has NO Amulet of Death", async () => {
      await characterDeathPenalties.applyPenalties(testCharacter, testCharacterBody);

      expect(dropCharacterItemsOnBodySpy).toHaveBeenCalled();
    });
  });
});
