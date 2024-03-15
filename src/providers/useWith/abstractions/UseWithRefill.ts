import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";

import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { container } from "@providers/inversify/container";
import { PlantGrowth } from "@providers/plant/PlantGrowth";
import { SimpleTutorial } from "@providers/simpleTutorial/SimpleTutorial";
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
    private animationEffect: AnimationEffect
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
          `Sorry, You can only ${resourceKey} the ${targetType} that you own.`
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
        await targetItem.save();

        await this.simpleTutorial.sendSimpleTutorialActionToCharacter(character, "plant-water");

        await originItem.save();

        await skillIncrease.increaseCraftingSP(character, ItemType.Plant, true);

        if (successMessages) {
          this.sendRandomMessageToCharacter(character, successMessages, true);
        }

        await this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.SkillLevelUp);
      }
    } catch (error) {
      console.log(error);
    }
  }

  private sendRandomMessageToCharacter(character: ICharacter, randomMessages: string[], isSuccess: boolean): void {
    if (isSuccess) {
      this.socketMessaging.sendMessageToCharacter(character, randomMessages[random(0, randomMessages.length - 1)]);
    } else {
      this.socketMessaging.sendErrorMessageToCharacter(character, randomMessages[random(0, randomMessages.length - 1)]);
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
      }

      if (successMessages) {
        this.sendRandomMessageToCharacter(character, successMessages, true);
      }

      await this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.SkillLevelUp);
    } catch (error) {
      console.log(error);
    }
  }
}
