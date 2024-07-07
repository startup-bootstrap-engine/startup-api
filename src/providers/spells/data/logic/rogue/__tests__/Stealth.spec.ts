/* eslint-disable no-unused-vars */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { Stealth } from "../Stealth";

describe("Stealth.ts", () => {
  let stealth: Stealth;
  let testCharacter: ICharacter;
  let targetCharacter: ICharacter;
  let sendErrorMessageToCharacter: jest.SpyInstance;
  let inventory: IItem;
  let inventoryContainer: IItemContainer;

  beforeAll(() => {
    stealth = container.get<Stealth>(Stealth);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(
      {},
      { hasEquipment: true, hasInventory: true, hasSkills: true }
    );

    targetCharacter = await unitTestHelper.createMockCharacter(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("turnInvisible method", () => {
    it("should return true when effect is successfully applied", async () => {
      // @ts-ignore
      jest.spyOn(stealth.specialEffect, "applyEffect").mockResolvedValue(true);
      // @ts-ignore
      jest.spyOn(stealth, "sendOpacityChange").mockResolvedValue();

      const result = await stealth.turnInvisible(testCharacter, 60);
      expect(result).toBe(true);
    });

    it("should return false when effect is not applied", async () => {
      // @ts-ignore
      jest.spyOn(stealth.specialEffect, "applyEffect").mockResolvedValue(false);

      const result = await stealth.turnInvisible(testCharacter, 60);
      expect(result).toBe(false);
    });
  });

  describe("turnVisible method", () => {
    it("should return true when effect is successfully removed", async () => {
      // @ts-ignore
      jest.spyOn(stealth.specialEffect, "removeEffect").mockResolvedValue(true);
      // @ts-ignore
      jest.spyOn(stealth, "sendOpacityChange").mockResolvedValue();

      const result = await stealth.turnVisible(testCharacter);
      expect(result).toBe(true);
    });

    it("should return false when effect is not removed", async () => {
      // @ts-ignore
      jest.spyOn(stealth.specialEffect, "removeEffect").mockResolvedValue(false);

      const result = await stealth.turnVisible(testCharacter);
      expect(result).toBe(false);
    });
  });

  describe("isInvisible method", () => {
    it("should return true when character is invisible", async () => {
      // @ts-ignore
      jest.spyOn(stealth.specialEffect, "isEffectApplied").mockResolvedValue(true);

      const result = await stealth.isInvisible(testCharacter);
      expect(result).toBe(true);
    });

    it("should return false when character is not invisible", async () => {
      // @ts-ignore
      jest.spyOn(stealth.specialEffect, "isEffectApplied").mockResolvedValue(false);

      const result = await stealth.isInvisible(testCharacter);
      expect(result).toBe(false);
    });
  });

  describe("cleanup method", () => {
    it("should call deleteAll method of inMemoryHashTable", async () => {
      // @ts-ignore
      const spy = jest.spyOn(stealth.inMemoryHashTable, "deleteAll").mockResolvedValue();

      await stealth.cleanup();
      // @ts-ignore
      expect(spy).toHaveBeenCalledWith(stealth.namespace);
    });
  });
});
