import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { RESOURCE_GATHERING_SKIP_TILES_IF_DESCRIPTION } from "@providers/constants/ResourceGatheringConstants";
import {
  RESOURCE_LEVEL_REQUIREMENTS,
  RESOURCE_LEVEL_REQUIREMENTS_RATIO,
} from "@providers/constants/ResourceRequirementConstants";
import { itemsBlueprintIndex } from "@providers/item/data/index";
import { MapTiles } from "@providers/map/MapTiles";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  AnimationEffectKeys,
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  ISkill,
  IUseWithTileValidation,
  ItemSocketEvents,
  MAP_LAYERS_TO_ID,
  ToGridX,
  ToGridY,
  UseWithSocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _, { isArray, isMap } from "lodash";
import { IUseWithTargetTile } from "../useWithTypes";
import { UseWithTileExhaustionControl } from "./UseWithTileExhaustionControl";
export interface IUseWithItemToTileReward {
  key: string;
  qty: number[] | number;
  chance: number | (() => Promise<boolean>); // can use a function to calculate the change, e.g.: isCraftSuccessful() from ItemCraftable.ts
}

export interface IUseWithItemToTileOptions {
  targetTile: IUseWithTargetTile;
  requiredResource?: {
    key: string | string[]; // In case is an array, it is one OR another
    decrementQty: number;
    errorMessage: string;
  };
  targetTileAnimationEffectKey?: string;

  successAnimationEffectKey?: string;
  errorAnimationEffectKey?: string;
  errorMessages?: string[];
  successMessages?: string[];
  rewards: IUseWithItemToTileReward[] | Map<string, IUseWithItemToTileReward[]>; // Rewards can be an array of rewards, or a map where the keys correspond to the required resource item key and the value is its corresponding rewards
}

@provide(UseWithItemToTile)
export class UseWithItemToTile {
  constructor(
    private animationEffect: AnimationEffect,
    private characterItemInventory: CharacterItemInventory,
    private socketMessaging: SocketMessaging,
    private characterItemContainer: CharacterItemContainer,
    private characterWeight: CharacterWeightQueue,
    private characterInventory: CharacterInventory,
    private useWithTileExhaustionControl: UseWithTileExhaustionControl,
    private mapTiles: MapTiles
  ) {}

  public async execute(
    character: ICharacter,
    options: IUseWithItemToTileOptions,
    skillIncrease: SkillIncrease
  ): Promise<void> {
    const {
      targetTile,
      requiredResource,
      targetTileAnimationEffectKey,
      errorMessages,
      rewards,
      successAnimationEffectKey,
      successMessages,
      errorAnimationEffectKey,
    } = options;

    const areResourcesDepleted = await this.useWithTileExhaustionControl.areResourcesDepleted(targetTile);

    if (areResourcesDepleted) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "The resources have been depleted here... Try looking for another spot!"
      );
      return;
    }

    let resourceKey = "";
    if (requiredResource) {
      let hasRequiredItem: {
        slotListId: string[];
        qty: number;
      } = {
        slotListId: [],
        qty: 0,
      };
      if (typeof requiredResource.key === "string") {
        hasRequiredItem = await this.characterItemInventory.checkItemsInInventoryByKey(requiredResource.key, character);
        resourceKey = requiredResource.key;
      } else {
        // requiredResource is an array
        // check if have AT LEAST one
        for (const k of requiredResource.key) {
          hasRequiredItem = await this.characterItemInventory.checkItemsInInventoryByKey(k, character);
          if (hasRequiredItem.qty > 0) {
            // check if have required qty
            if (requiredResource.decrementQty && hasRequiredItem.qty >= requiredResource.decrementQty) {
              resourceKey = k;
              break;
            }
          }
        }
      }

      if (hasRequiredItem.qty === 0) {
        this.socketMessaging.sendErrorMessageToCharacter(character, requiredResource.errorMessage);
        this.socketMessaging.sendEventToUser<IUseWithTileValidation>(
          character.channelId!,
          UseWithSocketEvents.UseWithTileValidation,
          {
            status: false,
          }
        );
        return;
      }

      if (requiredResource.decrementQty) {
        const decrementRequiredItem = await this.characterItemInventory.decrementItemFromInventoryByKey(
          resourceKey,
          character,
          requiredResource.decrementQty
        );

        if (!decrementRequiredItem) {
          this.socketMessaging.sendErrorMessageToCharacter(character);
          return;
        }
      }
    }

    if (targetTileAnimationEffectKey) {
      await this.animationEffect.sendAnimationEventToXYPosition(
        character,
        targetTileAnimationEffectKey,
        targetTile.x,
        targetTile.y
      );
    }

    let reward: IUseWithItemToTileReward[];

    if (isMap(rewards)) {
      const fetchedReward = rewards.get(resourceKey);

      if (!fetchedReward) {
        throw new Error(`No reward found for resource key ${resourceKey}`);
      }

      reward = fetchedReward;
    } else {
      reward = rewards;
    }

    const addedRewardToInventory = await this.addRewardToInventory(character, reward);

    if (!addedRewardToInventory) {
      if (errorMessages) {
        this.sendRandomMessageToCharacter(character, errorMessages);
      }

      if (errorAnimationEffectKey) {
        await this.animationEffect.sendAnimationEventToCharacter(
          character,
          errorAnimationEffectKey as AnimationEffectKeys
        );
      }
      await this.refreshInventory(character);

      return;
    }

    await this.characterWeight.updateCharacterWeight(character);

    if (successAnimationEffectKey) {
      await this.animationEffect.sendAnimationEventToCharacter(
        character,
        successAnimationEffectKey as AnimationEffectKeys
      );
    }

    // update crafting skills if corresponds
    for (const r of reward) {
      await skillIncrease.increaseCraftingSP(character, r.key, true);
    }

    if (successMessages) {
      this.sendRandomMessageToCharacter(character, successMessages);
    }

    const tileDescription = this.mapTiles.getPropertyFromLayer(
      targetTile.map,
      ToGridX(targetTile.x),
      ToGridY(targetTile.y),
      MAP_LAYERS_TO_ID[targetTile.layer],
      "description"
    );

    const shouldSkipTileExhaustionIncrement = RESOURCE_GATHERING_SKIP_TILES_IF_DESCRIPTION.some((description) =>
      tileDescription?.includes(description)
    );

    if (!shouldSkipTileExhaustionIncrement) {
      await this.useWithTileExhaustionControl.incrementResourceDepletion(targetTile);
    }

    await this.refreshInventory(character);
  }

  private sendRandomMessageToCharacter(character: ICharacter, randomMessages: string[]): void {
    this.socketMessaging.sendErrorMessageToCharacter(character, randomMessages[_.random(0, randomMessages.length - 1)]);
  }

  private async hasMinimumRequireLevelForReward(
    character: ICharacter,
    reward: IUseWithItemToTileReward,
    rewardName: string
  ): Promise<boolean> {
    // check if a character has a minimum level to gather a reward

    const resource = RESOURCE_LEVEL_REQUIREMENTS[reward.key];

    if (resource) {
      const skills = (await Skill.findOne({ owner: character._id })
        .lean()
        .cacheQuery({
          cacheKey: `${character._id}-skills`,
        })) as unknown as ISkill;

      if (!skills) {
        throw new Error("UseWith > Character does not have skills");
      }

      const characterLevel = skills[resource.type].level ?? 1;

      const minRequiredLevel = resource.minLevel * RESOURCE_LEVEL_REQUIREMENTS_RATIO;

      if (characterLevel < minRequiredLevel) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `You tried to get ${rewardName}, but it requires > ${minRequiredLevel} in ${resource.type}...`
        );
        return false;
      }
    }

    return true;
  }

  private async addRewardToInventory(character: ICharacter, rewards: IUseWithItemToTileReward[]): Promise<boolean> {
    const inventory = await this.characterInventory.getInventory(character);
    if (!inventory?.itemContainer) {
      console.error("Inventory container not found for character");
      return false;
    }
    const inventoryContainerId = inventory.itemContainer as string;

    for (const reward of rewards) {
      if (!(await this.shouldAddReward(reward))) {
        continue; // Skip to the next reward if the current one should not be added
      }

      const itemBlueprint = itemsBlueprintIndex[reward.key];
      if (!(await this.hasMinimumRequireLevelForReward(character, reward, itemBlueprint.name))) {
        continue; // Skip to the next reward if the character does not meet the level requirement
      }

      const qty = isArray(reward.qty) ? _.random(reward.qty[0], reward.qty[1]) : reward.qty;
      const added = await this.tryAddItemToInventory(character, itemBlueprint, qty, inventoryContainerId);
      if (added) {
        return true; // Return immediately after successfully adding at least one reward
      }
    }

    return false; // Return false if no rewards were added
  }

  private async shouldAddReward(reward: IUseWithItemToTileReward): Promise<boolean> {
    if (typeof reward.chance === "function") {
      return await reward.chance();
    }
    const randomNumber = _.random(0, 100);
    return randomNumber <= reward.chance;
  }

  private async tryAddItemToInventory(
    character: ICharacter,
    itemBlueprint: any,
    qty: number,
    inventoryContainerId: string
  ): Promise<boolean> {
    const item = new Item({ ...itemBlueprint, stackQty: qty, owner: character._id });
    // eslint-disable-next-line mongoose-lean/require-lean
    await item.save(); // Consider batching these operations if possible, or using an upsert operation to reduce the number of database calls

    return this.characterItemContainer.addItemToContainer(item, character, inventoryContainerId);
  }

  private async refreshInventory(character: ICharacter): Promise<void> {
    const inventory = await this.characterInventory.getInventory(character);

    const inventoryContainer = (await ItemContainer.findById(
      inventory?.itemContainer
    ).lean()) as unknown as IItemContainer;

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: inventoryContainer,
      openEquipmentSetOnUpdate: false,
      openInventoryOnUpdate: true,
    };

    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );
  }
}
