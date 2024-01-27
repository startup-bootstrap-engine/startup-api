import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SpellCalculator } from "@providers/spells/data/abstractions/SpellCalculator";
import {
  AnimationEffectKeys,
  CraftingSkill,
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  IItemUpdate,
  IItemUpdateAll,
  ItemSocketEvents,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { IPlantItem } from "./data/blueprints/PlantItem";
import { PlantLifeCycle } from "./data/types/PlantTypes";

@provide(PlantHarvest)
export class PlantHarvest {
  constructor(
    private socketMessaging: SocketMessaging,
    private blueprintManager: BlueprintManager,
    private spellCalculator: SpellCalculator,
    private characterInventory: CharacterInventory,
    private characterItemContainer: CharacterItemContainer,
    private animationEffect: AnimationEffect
  ) {}

  public async harvestPlant(plant: IItem, character: ICharacter): Promise<void> {
    if (!this.isPlantOwner(plant, character)) {
      this.sendErrorMessage(character, "Sorry, Only the owner can harvest this plant.");
      return;
    }

    if (!this.isPlantMature(plant)) {
      this.sendErrorMessage(character, "Sorry, Plant is not mature enough to be harvested");
      return;
    }

    const blueprint = await this.getPlantBlueprint(plant);
    if (!blueprint) {
      this.sendErrorMessage(character, "Sorry, the plant blueprint could not be found.");
      return;
    }

    const harvestableItemQuantity = await this.calculateHarvestableItemQuantity(character, blueprint);
    const harvestedItemBlueprint = await this.getHarvestedItemBlueprint(blueprint);
    const inventoryContainerId = await this.getInventoryContainerId(character);

    if (!inventoryContainerId) {
      this.sendErrorMessage(character, "Sorry,You don't have an inventory.");
      return;
    }

    if (!harvestedItemBlueprint) {
      this.sendErrorMessage(character, "An error occurred while processing your harvest.");
      return;
    }

    const newItem = await this.createAndSaveNewItem(harvestedItemBlueprint, harvestableItemQuantity);
    const wasItemAddedToContainer = await this.addItemToContainer(newItem, character, inventoryContainerId);

    if (!wasItemAddedToContainer) {
      this.sendErrorMessage(character, "An error occurred while processing your harvest.");
      return;
    }

    await this.sendAnimationEvent(character, plant);
    await this.updateInventory(character, inventoryContainerId, harvestedItemBlueprint, harvestableItemQuantity);
    await this.handlePlantAfterHarvest(plant, blueprint, character);
  }

  private isPlantOwner(plant: IItem, character: ICharacter): boolean {
    return plant.owner?.toString() === character._id.toString();
  }

  private isPlantMature(plant: IItem): boolean {
    return plant.currentPlantCycle === PlantLifeCycle.Mature;
  }

  private getPlantBlueprint(plant: IItem): Promise<IPlantItem | null> {
    return this.blueprintManager.getBlueprint("plants", plant.baseKey);
  }

  private calculateHarvestableItemQuantity(character: ICharacter, blueprint: IPlantItem): Promise<number> {
    const minMax = {
      max: blueprint.maxHarvestablePerPlant,
      min: 1,
    };
    // need to add farming skill
    return this.spellCalculator.getQuantityBasedOnSkillLevel(character, CraftingSkill.Fishing, minMax);
  }

  private getHarvestedItemBlueprint(blueprint: IPlantItem): Promise<IItem | null> {
    return this.blueprintManager.getBlueprint("items", blueprint.harvestableItemKey);
  }

  private async getInventoryContainerId(character: ICharacter): Promise<string | undefined> {
    const inventory = await this.characterInventory.getInventory(character);
    return inventory?.itemContainer?.toString();
  }

  private async createAndSaveNewItem(harvestedItemBlueprint: IItem, harvestableItemQuantity: number): Promise<IItem> {
    const newItem = new Item({
      ...harvestedItemBlueprint,
      stackQty: harvestableItemQuantity,
    });
    await newItem.save();
    return newItem;
  }

  private addItemToContainer(newItem: IItem, character: ICharacter, inventoryContainerId: string): Promise<boolean> {
    return this.characterItemContainer.addItemToContainer(newItem, character, inventoryContainerId);
  }

  private sendAnimationEvent(character: ICharacter, plant: IItem): Promise<void> {
    return this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.SkillLevelUp, plant._id);
  }

  private async updateInventory(
    character: ICharacter,
    inventoryContainerId: string,
    harvestedItemBlueprint: IItem,
    harvestableItemQuantity: number
  ): Promise<void> {
    const updatedInventoryContainer: IItemContainer = await ItemContainer.findById(inventoryContainerId).lean({
      virtuals: true,
      defaults: true,
    });

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: updatedInventoryContainer,
      openInventoryOnUpdate: true,
    };

    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );

    this.socketMessaging.sendMessageToCharacter(
      character,
      `${harvestableItemQuantity} ${harvestedItemBlueprint.name} harvested.`
    );
  }

  private async handlePlantAfterHarvest(plant: IItem, blueprint: IPlantItem, character: ICharacter): Promise<void> {
    if (!blueprint.regrowsAfterHarvest) {
      await plant.remove();
    } else {
      plant.currentPlantCycle = PlantLifeCycle.Seed;
      plant.texturePath = blueprint.stagesRequirements[PlantLifeCycle.Seed]?.texturePath ?? "";
      plant.growthPoints = 0;
      await plant.save();
      const itemToUpdate = this.prepareItemToUpdate(plant);

      await this.socketMessaging.sendEventToCharactersAroundCharacter<IItemUpdateAll>(
        character,
        ItemSocketEvents.UpdateAll,
        { items: [itemToUpdate] },
        true
      );
    }
  }

  private sendErrorMessage(character: ICharacter, message: string): void {
    this.socketMessaging.sendErrorMessageToCharacter(character, message);
  }

  private prepareItemToUpdate(item: IItem): IItemUpdate {
    return {
      id: item._id,
      texturePath: item.texturePath,
      textureAtlas: item.textureAtlas,
      type: item.type as ItemType,
      subType: item.subType as ItemSubType,
      name: item.name,
      x: item.x!,
      y: item.y!,
      layer: item.layer!,
      stackQty: item.stackQty || 0,
      isDeadBodyLootable: item.isDeadBodyLootable,
    };
  }
}
