import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { ItemMissingReferenceCleaner } from "../ItemMissingReferenceCleaner";

describe("ItemMissingReferenceCleaner.spec.ts", () => {
  let itemMissingReferenceCleaner: ItemMissingReferenceCleaner;
  let testItem: IItem;
  let testItemWithPersistent: IItem;
  let deleteManySpy: jest.SpyInstance;

  beforeAll(() => {
    itemMissingReferenceCleaner = container.get(ItemMissingReferenceCleaner);
  });

  beforeEach(async () => {
    testItem = await unitTestHelper.createMockItem({ isEquipped: false, isInDepot: false, carrier: undefined });

    testItemWithPersistent = await unitTestHelper.createMockItem({
      isEquipped: false,
      isInDepot: false,
      carrier: undefined,
      isPersistent: true,
    });
  });

  it("should delete items without owner but not delete items with persistent", async () => {
    // @ts-ignore
    deleteManySpy = jest.spyOn(Item, "deleteMany");

    await itemMissingReferenceCleaner.cleanupItemsWithoutOwnership();

    // it only delete testItem but not testItemWithPersistent
    expect(Item.deleteMany).toHaveBeenCalledWith({ _id: { $in: [testItem._id] } });
    expect(deleteManySpy).not.toHaveBeenCalledWith({ _id: { $in: [testItemWithPersistent._id] } });
  });
});
