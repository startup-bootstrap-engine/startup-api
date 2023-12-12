import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterWeight } from "@providers/character/weight/CharacterWeight";
import {
  RESOURCE_LEVEL_REQUIREMENTS,
  RESOURCE_LEVEL_REQUIREMENTS_RATIO,
} from "@providers/constants/ResourceRequirementConstants";
import { itemsBlueprintIndex } from "@providers/item/data/index";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  AnimationEffectKeys,
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  ISkill,
  IUseWithTileValidation,
  ItemSocketEvents,
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
    private characterWeight: CharacterWeight,
    private characterInventory: CharacterInventory,
    private useWithTileExhaustionControl: UseWithTileExhaustionControl
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

    void this.characterWeight.updateCharacterWeight(character);

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

    await this.useWithTileExhaustionControl.incrementResourceDepletion(targetTile);

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
        .select([resource.type])
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
    let atLeastOneRewardAdded = false;

    for (const reward of rewards) {
      let addReward = false;

      if (typeof reward.chance === "function") {
        addReward = await reward.chance();
      } else {
        const n = _.random(0, 100);
        addReward = n <= reward.chance;
      }

      if (addReward) {
        const itemBlueprint = itemsBlueprintIndex[reward.key];

        const hasMinimumRequireLevelForReward = await this.hasMinimumRequireLevelForReward(
          character,
          reward,
          itemBlueprint.name
        );

        if (!hasMinimumRequireLevelForReward) {
          return false;
        }

        const item = new Item({
          ...itemBlueprint,
          stackQty: isArray(reward.qty) ? _.random(reward.qty[0], reward.qty[1]) : reward.qty,
        });
        await item.save();

        const inventory = await this.characterInventory.getInventory(character);
        const inventoryContainerId = inventory?.itemContainer as unknown as string;

        // add it to the character's inventory
        atLeastOneRewardAdded = await this.characterItemContainer.addItemToContainer(
          item,
          character,
          inventoryContainerId
        );
      }
    }

    return atLeastOneRewardAdded;
  }

  private async refreshInventory(character: ICharacter): Promise<void> {
    const inventory = await this.characterInventory.getInventory(character);
    const inventoryContainer = (await ItemContainer.findById(inventory?.itemContainer)) as unknown as IItemContainer;

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
