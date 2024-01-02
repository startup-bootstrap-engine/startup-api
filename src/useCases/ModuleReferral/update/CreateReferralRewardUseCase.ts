import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { provide } from "inversify-binding-decorators";

@provide(CreateReferralRewardUseCase)
export class CreateReferralRewardUseCase {
  constructor(
    private characterItemContainer: CharacterItemContainer,
    private characterInventory: CharacterInventory,
    private blueprintManager: BlueprintManager
  ) {}

  public async awardReferralBonusToCharacter(characterId: string, amount: number): Promise<void> {
    try {
      const character = (await Character.findById(characterId).lean()) as ICharacter;

      if (!character) {
        throw new Error("Character not found");
      }

      const inventory = await this.characterInventory.getInventory(character);

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      const inventoryContainer = await ItemContainer.findById(inventory.itemContainer).lean();

      if (!inventoryContainer) {
        throw new Error("Inventory container not found");
      }

      const socialCrystalItemBlueprint = (await this.blueprintManager.getBlueprint(
        "items",
        CraftingResourcesBlueprint.SocialCrystal
      )) as Partial<IItem>;

      const newItem = new Item({
        ...socialCrystalItemBlueprint,
        quantity: amount,
      });

      await newItem.save();

      await this.characterItemContainer.addItemToContainer(newItem, character, inventoryContainer._id);
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}
