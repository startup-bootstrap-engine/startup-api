import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
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
    private characterInventory: CharacterInventory
  ) {}

  public async addGoldToCharacterInventory(character: ICharacter, amount: number): Promise<boolean> {
    if (amount <= 0) {
      return false;
    }

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
      const result = await this.characterItemContainer.addItemToContainer(
        newItem,
        character,
        inventoryContainer._id as string
      );

      if (result) {
        await this.characterWeight.updateCharacterWeight(character);
        return true;
      }

      console.error("Failed to add gold to the inventory.");
      return false;
    } catch (error) {
      return false;
    }
  }
}
