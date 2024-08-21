import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { ITEM_USE_WITH_BASE_SCALING_FACTOR } from "@providers/constants/ItemConstants";
import { blueprintManager, container, unitTestHelper } from "@providers/inversify/container";
import { UseWithHelper, calculateItemUseEffectPoints } from "../UseWithHelper";

describe("UseWithHelper", () => {
  let useWithHelper: UseWithHelper;
  let testCharacter: ICharacter;
  let testItem: IItem;

  beforeAll(() => {
    useWithHelper = container.get(UseWithHelper);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasSkills: true });
    testItem = await unitTestHelper.createMockItem(testCharacter._id);
  });

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const mockLeanMethod = (returnValue: any) => {
    const mockLean = jest.fn().mockResolvedValue(returnValue);
    jest.spyOn(Item, "findOne").mockReturnValue({ lean: mockLean } as any);
  };

  describe("basicValidations", () => {
    it("should return false if basic validation fails", () => {
      jest.spyOn(CharacterValidation.prototype, "hasBasicValidation").mockReturnValue(false);
      // @ts-ignore
      const result = useWithHelper.basicValidations(testCharacter, { originItemId: "itemId" });
      expect(result).toBe(false);
    });

    it("should return false if originItemId is missing", () => {
      jest.spyOn(CharacterValidation.prototype, "hasBasicValidation").mockReturnValue(true);
      // @ts-ignore
      const result = useWithHelper.basicValidations(testCharacter, { originItemId: "" });
      expect(result).toBe(false);
    });

    it("should return true if all validations pass", () => {
      jest.spyOn(CharacterValidation.prototype, "hasBasicValidation").mockReturnValue(true);
      // @ts-ignore
      const result = useWithHelper.basicValidations(testCharacter, { originItemId: "itemId" });
      expect(result).toBe(true);
    });
  });

  describe("getItem", () => {
    it("should throw an error if item does not exist", async () => {
      mockLeanMethod(null);

      await expect(useWithHelper.getItem(testCharacter, "nonexistentItemId")).rejects.toThrow(
        "UseWith > Item with id nonexistentItemId does not exist!"
      );
    });

    it("should throw an error if item does not belong to the character", async () => {
      const anotherCharacter = await unitTestHelper.createMockCharacter();
      mockLeanMethod({ ...testItem, owner: anotherCharacter._id });

      await expect(useWithHelper.getItem(testCharacter, testItem._id)).rejects.toThrow(
        `UseWith > Item with id ${testItem._id} does not belong to the character!`
      );
    });

    it("should return the item if it exists and belongs to the character", async () => {
      mockLeanMethod({ ...testItem, owner: testCharacter._id });

      const result = await useWithHelper.getItem(testCharacter, testItem._id);
      expect(result).toEqual({ ...testItem, owner: testCharacter._id });
    });
  });
});

describe("calculateItemUseEffectPoints", () => {
  let testCharacter: ICharacter;

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, { hasSkills: true });
  });

  it("should throw an error if item power is invalid", async () => {
    // @ts-ignore
    jest.spyOn(blueprintManager, "getBlueprint").mockResolvedValue(null);
    await expect(calculateItemUseEffectPoints("invalidItemKey", testCharacter)).rejects.toThrow(
      "Item invalidItemKey does not have a valid power property"
    );
  });

  it("should calculate effect points correctly", async () => {
    const mockItemData = { power: 10 } as any;
    // @ts-ignore
    jest.spyOn(blueprintManager, "getBlueprint").mockResolvedValue(mockItemData);

    const result = await calculateItemUseEffectPoints("validItemKey", testCharacter);
    expect(result).toBeGreaterThanOrEqual(mockItemData.power);
    expect(result).toBeLessThanOrEqual(mockItemData.power + 7 * ITEM_USE_WITH_BASE_SCALING_FACTOR);
  });
});
