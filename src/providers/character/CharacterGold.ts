import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IDepot } from "@entities/ModuleDepot/DepotModel";
import { IItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { DepotFinder } from "@providers/depot/DepotFinder";
import { blueprintManager } from "@providers/inversify/container";
import { OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { provide } from "inversify-binding-decorators";
import { CharacterInventory } from "./CharacterInventory";
import { CharacterItemContainer } from "./characterItems/CharacterItemContainer";
import { CharacterWeightQueue } from "./weight/CharacterWeightQueue";

@provide(CharacterGold)
export class CharacterGold {
  constructor(
    private characterItemContainer: CharacterItemContainer,
    private characterWeight: CharacterWeightQueue,
    private characterInventory: CharacterInventory,
    private depotFinder: DepotFinder
  ) {}

  public async addGoldToCharacterInventory(character: ICharacter, amount: number): Promise<boolean> {
    if (amount <= 0) {
      return false;
    }

    amount = Math.round(amount); // Round to integer to avoid fractional gold

    const inventoryContainer = await this.characterInventory.getInventoryItemContainer(character);

    if (!inventoryContainer) {
      console.error("Character inventory container not found.");
      return false;
    }

    const blueprint = await blueprintManager.getBlueprint<IItem>("items", OthersBlueprint.GoldCoin);
    const newItem = new Item({ ...blueprint, owner: character._id, stackQty: amount });
    // eslint-disable-next-line mongoose-lean/require-lean
    await newItem.save();

    try {
      let result = await this.tryAddingItemInventory(character, newItem, inventoryContainer);

      if (!result) {
        // If inventory is full, try adding to the depot
        const depot = await this.depotFinder.findDepotWithSlots(character);

        if (!depot) {
          throw new Error("No depot found with available slots.");
        }

        result = await this.tryAddingItemDepot(newItem, character, depot);
      }

      if (result) {
        await this.characterWeight.updateCharacterWeight(character);
        return true;
      }

      console.error("Failed to add gold to the inventory or depot.");
      return false;
    } catch (error) {
      console.error("Error adding gold to inventory or depot:", error);
      return false;
    }
  }

  private async tryAddingItemInventory(
    character: ICharacter,
    item: IItem,
    inventoryContainer: IItemContainer
  ): Promise<boolean> {
    return await this.characterItemContainer.addItemToContainer(item, character, inventoryContainer._id as string);
  }

  private async tryAddingItemDepot(item: IItem, character: ICharacter, depot: IDepot): Promise<boolean> {
    console.log("depot", depot.itemContainer);
    return await this.characterItemContainer.addItemToContainer(item, character, depot.itemContainer as string);
  }
}
