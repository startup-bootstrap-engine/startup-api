import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import {
  FARMING_BASE_YIELD,
  FARMING_RANDOM_REWARD_QTY_CAP,
  FARMING_SKILL_FACTOR,
} from "@providers/constants/FarmingConstants";
import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { TraitGetter } from "@providers/skill/TraitGetter";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SpellCalculator } from "@providers/spells/data/abstractions/SpellCalculator";
import {
  AnimationEffectKeys,
  CraftingSkill,
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  IItemUpdate,
  IItemUpdateAll,
  ItemRarities,
  ItemSocketEvents,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { random } from "lodash";
import { CharacterPlantActions } from "./CharacterPlantActions";
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
    private animationEffect: AnimationEffect,
    private skillIncrease: SkillIncrease,
    private traitGetter: TraitGetter,
    private characterPlantActions: CharacterPlantActions
  ) {}

  @TrackNewRelicTransaction()
  public async harvestPlant(plant: IItem, character: ICharacter): Promise<void> {
    if (plant.isDead) {
      this.sendErrorMessage(character, "Sorry, you can't harvest the plant because it is already dead.");
      return;
    }

    if (!this.isPlantMature(plant)) {
      this.sendErrorMessage(character, "Sorry, your plant is not mature enough to be harvested.");
      return;
    }

    if (!this.isPlantOwner(plant, character)) {
      const canPerformActionsOnUnownedPlant = await this.characterPlantActions.canPerformActionOnUnowedPlant(
        character,
        plant,
        `💀 ${character.name} is stealing your plants!`
      );

      if (!canPerformActionsOnUnownedPlant) {
        return;
      }
    }

    const blueprint = await this.getPlantBlueprint(plant);
    if (!blueprint) {
      this.sendErrorMessage(character, "Sorry, the plant blueprint could not be found.");
      return;
    }

    const skills = await this.spellCalculator.getCharacterSkill(character);
    const skillLevel = await this.traitGetter.getSkillLevelWithBuffs(skills, CraftingSkill.Farming);
    const harvestableItemQuantity = this.calculateCropYield(skillLevel, blueprint);

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

    const newItem = await this.createAndSaveNewItem(character, harvestedItemBlueprint, harvestableItemQuantity);

    const rarity = this.getRandomRarity(skillLevel);
    newItem.rarity = rarity;
    // eslint-disable-next-line mongoose-lean/require-lean
    await newItem.save();

    const wasItemAddedToContainer = await this.addItemToContainer(newItem, character, inventoryContainerId);

    const n = Math.floor(Math.random() * 100);

    if (n < 25) {
      const extraReward = await this.getExtraReward();
      const extraRewardItem = await this.createAndSaveNewItem(
        character,
        extraReward,
        random(1, FARMING_RANDOM_REWARD_QTY_CAP)
      );
      await this.addItemToContainer(extraRewardItem, character, inventoryContainerId);
    }

    if (!wasItemAddedToContainer) {
      this.sendErrorMessage(character, "An error occurred while processing your harvest.");
      return;
    }

    await this.sendAnimationEvent(character, plant);
    await this.updateInventory(character, inventoryContainerId, harvestedItemBlueprint, harvestableItemQuantity);

    await this.skillIncrease.increaseCraftingSP(character, ItemType.Plant, true);

    await this.handlePlantAfterHarvest(plant, blueprint, character);
  }

  private calculateProbabilities(skillLevel: number): { [key in ItemRarities]: number } {
    const probabilityConfig: { [key: string]: { [key in ItemRarities]: number } } = {
      low: {
        Common: 0.7,
        Uncommon: 0.2,
        Rare: 0.08,
        Epic: 0.02,
        Legendary: 0,
      },
      medium: {
        Common: 0.3,
        Uncommon: 0.5,
        Rare: 0.15,
        Epic: 0.05,
        Legendary: 0,
      },
      high: {
        Common: 0.1,
        Uncommon: 0.3,
        Rare: 0.4,
        Epic: 0.15,
        Legendary: 0.05,
      },
      veryHigh: {
        Common: 0.05,
        Uncommon: 0.15,
        Rare: 0.3,
        Epic: 0.4,
        Legendary: 0.1,
      },
      max: {
        Common: 0,
        Uncommon: 0.05,
        Rare: 0.15,
        Epic: 0.3,
        Legendary: 0.5,
      },
    };

    if (skillLevel <= 10) return probabilityConfig.low;
    if (skillLevel <= 30) return probabilityConfig.medium;
    if (skillLevel <= 60) return probabilityConfig.high;
    if (skillLevel <= 100) return probabilityConfig.veryHigh;
    return probabilityConfig.max;
  }

  private getRandomRarity(skillLevel: number): ItemRarities {
    const probabilities = this.calculateProbabilities(skillLevel);
    const random = Math.random();

    let cumulativeProbability = 0;
    for (const rarity in probabilities) {
      cumulativeProbability += probabilities[rarity as ItemRarities];
      if (random < cumulativeProbability) {
        return rarity as ItemRarities;
      }
    }

    // Fallback in case of rounding errors
    return ItemRarities.Common;
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

  private calculateCropYield(farmingSkill: number, blueprint: IPlantItem): number {
    return Math.round(
      FARMING_BASE_YIELD + FARMING_BASE_YIELD * FARMING_SKILL_FACTOR * Math.sqrt(farmingSkill) * blueprint.yieldFactor
    );
  }

  private getHarvestedItemBlueprint(blueprint: IPlantItem): Promise<IItem | null> {
    return this.blueprintManager.getBlueprint("items", blueprint.harvestableItemKey);
  }

  private getExtraReward(): Promise<IItem> {
    const potentialExtraRewards = [
      CraftingResourcesBlueprint.Herb,
      CraftingResourcesBlueprint.ElvenLeaf,
      CraftingResourcesBlueprint.Worm,
      CraftingResourcesBlueprint.MedicinalLeaf,
      CraftingResourcesBlueprint.WhisperrootEntwiner,
    ];

    const randomReward = potentialExtraRewards[Math.floor(Math.random() * potentialExtraRewards.length)];

    return this.blueprintManager.getBlueprint("items", randomReward);
  }

  private async getInventoryContainerId(character: ICharacter): Promise<string | undefined> {
    const inventory = await this.characterInventory.getInventory(character);
    return inventory?.itemContainer?.toString();
  }

  private async createAndSaveNewItem(
    character: ICharacter,
    harvestedItemBlueprint: IItem,
    harvestableItemQuantity: number
  ): Promise<IItem> {
    const newItem = new Item({
      ...harvestedItemBlueprint,
      stackQty: harvestableItemQuantity,
      owner: character._id,
    });
    // eslint-disable-next-line mongoose-lean/require-lean
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
      const currentRegrowthCount = (plant.regrowthCount ?? 0) + 1;
      const regrowAfterHarvestLimit = blueprint.regrowAfterHarvestLimit;

      if (!regrowAfterHarvestLimit || currentRegrowthCount > regrowAfterHarvestLimit) {
        await plant.remove();
        return;
      }

      plant.currentPlantCycle = PlantLifeCycle.Seed;
      plant.texturePath = blueprint.stagesRequirements[PlantLifeCycle.Seed]?.texturePath ?? "";
      plant.growthPoints = 0;
      plant.requiredGrowthPoints = blueprint.stagesRequirements[PlantLifeCycle.Seed]?.requiredGrowthPoints ?? 0;
      plant.regrowthCount = currentRegrowthCount;
      // eslint-disable-next-line mongoose-lean/require-lean
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
      isTileTinted: item.isTileTinted,
      lastWatering: item.lastWatering!,
      growthPoints: item.growthPoints!,
      requiredGrowthPoints: item.requiredGrowthPoints!,
      isDead: item.isDead,
    };
  }
}
