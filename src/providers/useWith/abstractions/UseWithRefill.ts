import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";

import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { container } from "@providers/inversify/container";
import { ItemView } from "@providers/item/ItemView";
import { PlantGrowth } from "@providers/plant/PlantGrowth";
import { SimpleTutorial } from "@providers/tutorial/simpleTutorial/SimpleTutorial";
import {
  AnimationEffectKeys,
  IRefillableItem,
  IUseWithTileValidation,
  ItemType,
  UseWithSocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { random } from "lodash";
import { IUseWithTargetTile } from "../useWithTypes";

export interface IUseWithRefill {
  targetItem?: IItem;
  originItem: IItem;
  targetTile?: IUseWithTargetTile;
  decrementQty?: number;
  targetType?: string;
  targetEntityAnimationEffectKey?: string;
  successAnimationEffectKey?: string;
  errorAnimationEffectKey?: string;
  successMessages?: string[];
}

@provide(UseWithRefill)
export class UseWithRefill {
  constructor(
    private socketMessaging: SocketMessaging,
    private movementHelper: MovementHelper,
    private plantGrowth: PlantGrowth,
    private simpleTutorial: SimpleTutorial,
    private animationEffect: AnimationEffect,
    private itemView: ItemView
  ) {}

  public async executeUse(character: ICharacter, options: IUseWithRefill, skillIncrease: SkillIncrease): Promise<void> {
    const { targetItem, originItem, decrementQty, targetType, successMessages } = options;

    if (!targetItem) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, item you are trying to use was not found.");
      return;
    }

    try {
      const blueprintManager = container.get<BlueprintManager>(BlueprintManager);
      const blueprintRefill = (await blueprintManager.getBlueprint("items", originItem?.baseKey!)) as IRefillableItem;

      if (!blueprintRefill) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, the blueprint could not be found.");
        return;
      }

      if (
        !this.movementHelper.isUnderRange(
          character.x!,
          character.y!,
          targetItem.x!,
          targetItem.y!,
          blueprintRefill.useWithMaxDistanceGrid
        )
      ) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, your target is out of reach.");
        return;
      }

      const resourceKey = blueprintRefill.refillResourceKey;

      if (!originItem.remainingUses || originItem.remainingUses === 0) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `Sorry, Please refill your tool on a ${resourceKey} source.`
        );
        return;
      }

      if (targetItem.type !== targetType) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `Sorry, only ${targetType}s can be ${resourceKey}.`
        );
        return;
      }

      if (targetItem.owner?.toString() !== character.id) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          `Sorry, You can only ${resourceKey} ${targetType}s that you own.`
        );
        return;
      }

      if (resourceKey === "water" && targetItem.isDead) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, you can't water the plant because it is already dead."
        );
        return;
      }

      let isSuccess = false;

      if (resourceKey === "water") {
        isSuccess = await this.plantGrowth.updatePlantGrowth(targetItem, character);
      }

      if (isSuccess) {
        originItem.remainingUses -= decrementQty ?? 1;

        // send watered plant event to client
        this.socketMessaging.sendEventToUser<IUseWithTileValidation>(
          character.channelId!,
          UseWithSocketEvents.UseWithWater,
          {
            status: true,
          }
        );

        targetItem.isTileTinted = true;
        await Item.updateOne({ _id: targetItem._id }, { $set: { isTileTinted: true } });

        await this.simpleTutorial.sendSimpleTutorialActionToCharacter(character, "plant-water");

        await Item.updateOne({ _id: originItem._id }, { $set: { remainingUses: originItem.remainingUses } });

        await skillIncrease.increaseCraftingSP(character, ItemType.Plant, true);

        if (successMessages) {
          this.sendRandomMessageToCharacter(character, successMessages, true, targetItem);
        }

        await this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.SkillLevelUp);

        await this.itemView.warnCharacterAboutItemsInView(character, { always: true });
      }
    } catch (error) {
      console.log(error);
    }
  }

  private sendRandomMessageToCharacter(
    character: ICharacter,
    randomMessages: string[],
    isSuccess: boolean,
    targetItem: IItem | null
  ): void {
    let message = randomMessages[random(0, randomMessages.length - 1)];

    if (targetItem && targetItem.type === ItemType.Plant) {
      const growthInfo = this.plantGrowth.getGrowthInfo(targetItem);
      message += ` Growth: (${growthInfo.growthPoints}/${growthInfo.requiredGrowthPoints})`;
    }

    if (isSuccess) {
      this.socketMessaging.sendMessageToCharacter(character, message);
    } else {
      this.socketMessaging.sendErrorMessageToCharacter(character, message);
    }
  }

  public async executeRefill(
    character: ICharacter,
    options: IUseWithRefill,
    skillIncrease: SkillIncrease
  ): Promise<void> {
    const { originItem, successMessages } = options;

    try {
      const blueprintManager = container.get<BlueprintManager>(BlueprintManager);

      const blueprintRefill = (await blueprintManager.getBlueprint("items", originItem?.baseKey!)) as IRefillableItem;

      if (!blueprintRefill) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, the blueprint could not be found.");
        return;
      }

      const initialRemainingUses = blueprintRefill.initialRemainingUses;

      if (originItem.remainingUses !== initialRemainingUses) {
        await Item.updateOne({ _id: originItem._id }, { $set: { remainingUses: initialRemainingUses } });
      } else {
        this.socketMessaging.sendMessageToCharacter(character, "You have already refilled your watering can. 🌊");
      }

      if (successMessages) {
        this.sendRandomMessageToCharacter(character, successMessages, true, null);
      }

      await this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.SkillLevelUp);
    } catch (error) {
      console.log(error);
    }
  }
}
