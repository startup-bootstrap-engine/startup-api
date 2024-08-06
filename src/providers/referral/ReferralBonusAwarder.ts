import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IDepot } from "@entities/ModuleDepot/DepotModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { DepotFinder } from "@providers/depot/DepotFinder";
import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";

import { provide } from "inversify-binding-decorators";

@provide(ReferralBonusAwarder)
export class ReferralBonusAwarder {
  constructor(
    private characterItemContainer: CharacterItemContainer,
    private characterInventory: CharacterInventory,
    private blueprintManager: BlueprintManager,
    private depotFinder: DepotFinder
  ) {}

  public async awardReferralBonusToCharacter(characterId: string, amount: number): Promise<void> {
    try {
      const character = await this.getCharacter(characterId);
      const inventory = await this.getInventory(character);

      if (!inventory.itemContainer) throw new Error("Character inventory does not have an item container");

      const inventoryContainer = await this.getContainer(inventory.itemContainer.toString());
      const newItem = await this.createRewardItem(characterId, amount);

      try {
        await this.addItemToContainer(newItem, character, inventoryContainer._id);
      } catch (error) {
        console.log("Failed to add referral bonus to inventory. Adding to depot instead.");
        const depot = await this.getDepot(character);

        if (!depot.itemContainer) throw new Error("Depot does not have an item container");

        const depotItemContainer = await this.getContainer(depot.itemContainer.toString());
        const wasAddedToDepot = await this.addItemToContainer(newItem, character, depotItemContainer._id);

        if (!wasAddedToDepot) {
          throw new Error("Failed to add referral bonus to depot");
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async getCharacter(characterId: string): Promise<ICharacter> {
    const character = (await Character.findById(characterId).lean()) as ICharacter;
    if (!character) throw new Error("Character not found");
    return character;
  }

  private async getInventory(character: ICharacter): Promise<IItem> {
    const inventory = await this.characterInventory.getInventory(character);
    if (!inventory) throw new Error("Inventory not found");
    return inventory;
  }

  private async getContainer(containerId: string): Promise<IItemContainer> {
    const container = (await ItemContainer.findById(containerId).lean()) as IItemContainer;
    if (!container) throw new Error("Container not found");
    return container;
  }

  private async createRewardItem(characterId: string, amount: number): Promise<IItem> {
    const socialCrystalItemBlueprint = (await this.blueprintManager.getBlueprint(
      "items",
      CraftingResourcesBlueprint.SocialCrystal
    )) as Partial<IItem>;

    const newItem = new Item({
      ...socialCrystalItemBlueprint,
      stackQty: amount,
      owner: characterId,
    });

    // eslint-disable-next-line mongoose-lean/require-lean
    await newItem.save();
    return newItem;
  }

  private async addItemToContainer(item: IItem, character: ICharacter, containerId: string): Promise<boolean> {
    const wasAdded = await this.characterItemContainer.addItemToContainer(item, character, containerId);
    if (!wasAdded) throw new Error("Referral: Failed to add item to container");

    return wasAdded;
  }

  private async getDepot(character: ICharacter): Promise<IDepot> {
    const depot = await this.depotFinder.findDepotWithSlots(character);
    if (!depot) throw new Error("Depot not found");
    return depot;
  }
}
