import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { ItemOwnership } from "../ItemOwnership";
import { ContainersBlueprint, SwordsBlueprint } from "../data/types/itemsBlueprintTypes";

describe("ItemOwnership.ts", () => {
  let testCharacter: ICharacter;
  let backpack: IItem;
  let backpackContainer: IItemContainer;
  let itemOwnership: ItemOwnership;

  beforeAll(() => {
    itemOwnership = container.get<ItemOwnership>(ItemOwnership);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();

    backpack = await unitTestHelper.createMockItemFromBlueprint(ContainersBlueprint.Backpack);
    backpackContainer = (await ItemContainer.findById(backpack.itemContainer)) as unknown as IItemContainer;
  });

  it("should properly add item ownership", async () => {
    await itemOwnership.addItemOwnership(backpack, testCharacter);

    const updatedBackpack = await Item.findById(backpack._id);
    const updatedBackpackContainer = await ItemContainer.findById(backpackContainer._id);

    expect(updatedBackpack?.owner).toEqual(testCharacter._id);
    expect(updatedBackpackContainer?.owner).toEqual(testCharacter._id);
  });

  it("should properly add item ownership for all container items", async () => {
    const shortSword = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.Sword);

    backpackContainer.slots[0] = shortSword.toJSON({ virtuals: true });
    backpackContainer.markModified("slots");
    await backpackContainer.save();

    await itemOwnership.addItemOwnership(backpack, testCharacter);

    const updatedShortSword = await Item.findById(shortSword._id);

    expect(updatedShortSword?.owner).toEqual(testCharacter._id);
  });

  it("should properly remove item ownership from all items in container", async () => {
    const shortSword = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.Sword);
    const longSword = await unitTestHelper.createMockItemFromBlueprint(SwordsBlueprint.Sword);

    backpackContainer.slots[0] = shortSword.toJSON({ virtuals: true });
    backpackContainer.slots[1] = longSword.toJSON({ virtuals: true });
    backpackContainer.markModified("slots");
    await backpackContainer.save();

    await itemOwnership.addItemOwnership(backpack, testCharacter);

    await itemOwnership.removeOwnershipFromAllItemsInContainer(backpackContainer);

    const updatedShortSword = await Item.findById(shortSword._id);
    const updatedLongSword = await Item.findById(longSword._id);

    expect(updatedShortSword?.owner).toBeNull();
    expect(updatedLongSword?.owner).toBeNull();
  });

  it("should properly remove item ownership", async () => {
    await itemOwnership.addItemOwnership(backpack, testCharacter);

    await itemOwnership.removeItemOwnership(backpack);

    const updatedBackpack = await Item.findById(backpack._id);
    const updatedBackpackContainer = await ItemContainer.findById(backpackContainer._id);

    expect(updatedBackpack?.owner).toBeUndefined();
    expect(updatedBackpackContainer?.owner).toBeUndefined();
  });

  it("should not change ownership if the item is already owned by the character", async () => {
    backpack.owner = testCharacter._id;
    await backpack.save();

    const result = await itemOwnership.addItemOwnership(backpack, testCharacter);
    expect(result).toBe(false);

    const updatedBackpack = await Item.findById(backpack._id);
    expect(updatedBackpack?.owner).toEqual(testCharacter._id);
  });

  it("should handle errors in addItemOwnership gracefully", async () => {
    jest.spyOn(Item, "updateOne").mockImplementationOnce(() => {
      throw new Error("Mock Error");
    });

    const result = await itemOwnership.addItemOwnership(backpack, testCharacter);
    expect(result).toBe(false);
  });

  it("should add ownership to nested containers", async () => {
    const smallPouch = await unitTestHelper.createMockItemFromBlueprint(ContainersBlueprint.Pouch);
    const smallPouchContainer = await ItemContainer.findById(smallPouch.itemContainer);

    backpackContainer.slots[0] = smallPouch.toJSON({ virtuals: true });
    smallPouchContainer!.slots[0] = { ...smallPouch.toJSON({ virtuals: true }) };
    backpackContainer.markModified("slots");
    await backpackContainer.save();
    await smallPouchContainer!.save();

    await itemOwnership.addItemOwnership(backpack, testCharacter);

    const updatedBackpack = await Item.findById(backpack._id);
    const updatedPouch = await Item.findById(smallPouch._id);
    expect(updatedBackpack?.owner).toEqual(testCharacter._id);
    expect(updatedPouch?.owner).toEqual(testCharacter._id);
  });

  it("should not add ownership to items if already visited", async () => {
    jest.spyOn(itemOwnership, "addItemOwnership").mockImplementationOnce(() => Promise.resolve(true));

    const smallPouch = await unitTestHelper.createMockItemFromBlueprint(ContainersBlueprint.Pouch);
    backpackContainer.slots[0] = smallPouch.toJSON({ virtuals: true });
    backpackContainer.markModified("slots");
    await backpackContainer.save();

    await itemOwnership.addOwnershipToAllItemsInContainer(
      backpack.itemContainer as string,
      testCharacter._id.toString()
    );
    expect(itemOwnership.addItemOwnership).toHaveBeenCalledTimes(1);
  });

  it("should not remove ownership if the container is already visited", async () => {
    const smallPouch = await unitTestHelper.createMockItemFromBlueprint(ContainersBlueprint.Pouch);
    backpackContainer.slots[0] = smallPouch.toJSON({ virtuals: true });
    backpackContainer.markModified("slots");
    await backpackContainer.save();

    await itemOwnership.addItemOwnership(backpack, testCharacter);
    const visited = new Set<string>([backpackContainer._id.toString()]);

    await itemOwnership.removeOwnershipFromAllItemsInContainer(backpackContainer, visited);
    const updatedPouch = await Item.findById(smallPouch._id);
    expect(updatedPouch?.owner).toEqual(testCharacter._id);
  });
});
