import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { ItemOwnership } from "@providers/item/ItemOwnership";
import { ItemView } from "@providers/item/ItemView";
import { ItemPickupFromMap } from "../ItemPickupFromMap";

describe("ItemPickupFromMap", () => {
  let itemPickupFromMap: ItemPickupFromMap;

  let character: ICharacter;
  let item: IItem;

  beforeAll(() => {
    itemPickupFromMap = container.get(ItemPickupFromMap);
  });

  beforeEach(async () => {
    character = await unitTestHelper.createMockCharacter(null, { hasInventory: true, hasEquipment: true });
    item = await unitTestHelper.createMockItem();
  });

  describe("pickupFromMapContainer", () => {
    it("should successfully remove item from the map, add ownership, and return true", async () => {
      jest.spyOn(ItemView.prototype, "removeItemFromMap").mockResolvedValue(true);
      jest.spyOn(ItemOwnership.prototype, "addItemOwnership").mockResolvedValue(true);

      const result = await itemPickupFromMap.pickupFromMapContainer(item, character);
      expect(result).toBe(true);
      expect(ItemView.prototype.removeItemFromMap).toHaveBeenCalledWith(item);
      expect(ItemOwnership.prototype.addItemOwnership).toHaveBeenCalledWith(item, character);
    });

    it("should fail to remove item from the map and return false", async () => {
      jest.spyOn(ItemView.prototype, "removeItemFromMap").mockResolvedValue(false);
      // @ts-ignore
      const sendErrorMessageSpy = jest.spyOn(itemPickupFromMap.socketMessaging, "sendErrorMessageToCharacter");

      const result = await itemPickupFromMap.pickupFromMapContainer(item, character);
      expect(result).toBe(false);
      expect(ItemView.prototype.removeItemFromMap).toHaveBeenCalledWith(item);
      expect(sendErrorMessageSpy).toHaveBeenCalledWith(character, "Sorry, failed to remove item from map.");
    });
  });
});
