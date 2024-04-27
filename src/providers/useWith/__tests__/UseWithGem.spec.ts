import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { container, unitTestHelper } from "@providers/inversify/container";
import { IItemGem, ItemType } from "@rpg-engine/shared";
import { UseWithGem } from "../abstractions/UseWithGem";

describe("UseWithGem.ts", () => {
  let useWithGem: UseWithGem;
  let testCharacter: ICharacter;
  let originItem: IItem;
  let targetItem: IItem;
  let sendErrorMessageToCharacter: jest.SpyInstance;
  let sendMessageToCharacter: jest.SpyInstance;
  let blueprintManager: BlueprintManager;

  beforeAll(() => {
    useWithGem = container.get<UseWithGem>(UseWithGem);
    blueprintManager = container.get<BlueprintManager>(BlueprintManager);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasInventory: true,
      hasEquipment: true,
    });

    originItem = await unitTestHelper.createMockItemFromBlueprint("ruby-gem");

    targetItem = await unitTestHelper.createMockItemFromBlueprint("sword");

    // @ts-ignore
    sendErrorMessageToCharacter = jest.spyOn(useWithGem.socketMessaging, "sendErrorMessageToCharacter");

    // @ts-ignore
    sendMessageToCharacter = jest.spyOn(useWithGem.socketMessaging, "sendMessageToCharacter");
  });

  it("should send error message and return if the target is not a weapon", async () => {
    targetItem.type = ItemType.Other;

    await useWithGem.execute(originItem, targetItem, testCharacter);

    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, only weapons can be used with gems."
    );
  });

  it("should send error message and return if the gem is already equipped", async () => {
    const attachedGems = {
      key: originItem.key,
      name: originItem.name,
      gemStatBuff: {
        attack: 1,
        defense: 1,
      },
      gemEntityEffectsAdd: ["burning"],
    };

    targetItem.attachedGems = [attachedGems] as any;

    await useWithGem.execute(originItem, targetItem, testCharacter);

    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, you already have this gem equipped."
    );
  });

  it("should send error message if number of gems equipped is greater than the tier can hold", async () => {
    // from 1 to 4 only one gem can be equipped
    targetItem.tier = 4;

    targetItem.attachedGems = [{}] as any;

    await useWithGem.execute(originItem, targetItem, testCharacter);

    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, you can only have 1 gem(s) equipped."
    );

    // from 5 to 9 only two gems can be equipped
    targetItem.tier = 9;

    targetItem.attachedGems = [{}, {}] as any;

    await useWithGem.execute(originItem, targetItem, testCharacter);

    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, you can only have 2 gem(s) equipped."
    );

    // from 10 to 14 only three gems can be equipped
    targetItem.tier = 14;

    targetItem.attachedGems = [{}, {}, {}] as any;

    await useWithGem.execute(originItem, targetItem, testCharacter);

    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, you can only have 3 gem(s) equipped."
    );

    // from 15 only four gems can be equipped
    targetItem.tier = 15;

    targetItem.attachedGems = [{}, {}, {}, {}] as any;

    await useWithGem.execute(originItem, targetItem, testCharacter);

    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      "Sorry, you can only have 4 gem(s) equipped."
    );
  });

  it("should equipped the gem if all requirements are met", async () => {
    const targetItemAttack = targetItem.attack ?? 0;
    const targetItemDefense = targetItem.defense ?? 0;
    const attachedGemCount = targetItem.attachedGems?.length ?? 0;

    const originItemBlueprint = (await blueprintManager.getBlueprint("items", originItem.key)) as IItemGem;

    await useWithGem.execute(originItem, targetItem, testCharacter);

    expect(sendMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      `You equipped ${originItem.name} to ${targetItem.name}.`
    );

    expect(targetItem.attachedGems?.length).toEqual(attachedGemCount + 1);

    const updateTargetItem = await Item.findById(targetItem._id).lean({ virtuals: true, defaults: true });

    expect(updateTargetItem?.attack).toEqual(targetItemAttack + (originItemBlueprint.gemStatBuff?.attack ?? 0));
    expect(updateTargetItem?.defense).toEqual(targetItemDefense + (originItemBlueprint.gemStatBuff?.defense ?? 0));
    // @ts-ignore
    expect(updateTargetItem?.entityEffects).toContain(originItemBlueprint.gemEntityEffectsAdd[0]);
  });
});
