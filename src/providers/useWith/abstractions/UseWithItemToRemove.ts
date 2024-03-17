import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { CharacterPlantActions } from "@providers/plant/CharacterPlantActions";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { AnimationEffectKeys, ItemType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _, { random } from "lodash";
export interface IUseWithRemove {
  targetItem: IItem;
  originItem?: IItem;
  successAnimationEffectKey?: AnimationEffectKeys;
  errorAnimationEffectKey?: AnimationEffectKeys;
  errorMessages?: string[];
  successMessages?: string[];
}
@provide(UseWithItemToRemove)
export class UseWithItemToRemove {
  constructor(
    private socketMessaging: SocketMessaging,
    private animationEffect: AnimationEffect,
    private characterPlantActions: CharacterPlantActions
  ) {}

  public async executeUse(character: ICharacter, options: IUseWithRemove, skillIncrease: SkillIncrease): Promise<void> {
    const { targetItem, successAnimationEffectKey, errorMessages, successMessages } = options;

    // for now we can remove only plants
    if (targetItem.type !== ItemType.Plant) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you can only remove plants.");
      return;
    }

    if (!this.isOwner(targetItem, character) && !targetItem.isDead) {
      const canPerformActionOnUnowedPlant = await this.characterPlantActions.canPerformActionOnUnowedPlant(
        character,
        targetItem,
        `💀 ${character.name} is destroying your crops!`
      );

      if (!canPerformActionOnUnowedPlant) {
        return;
      }
    }

    await this.tryToDestroyPlant(
      character,
      targetItem,
      successAnimationEffectKey!,
      errorMessages!,
      successMessages!,
      skillIncrease
    );
  }

  private async tryToDestroyPlant(
    character: ICharacter,
    targetItem: IItem,
    successAnimationEffectKey: AnimationEffectKeys,
    errorMessages: string[],
    successMessages: string[],
    skillIncrease: SkillIncrease
  ): Promise<void> {
    const chance = 75;
    const n = _.random(0, 100);
    if (n >= chance) {
      if (errorMessages) {
        this.sendRandomMessageToCharacter(character, errorMessages, false);
      }
      return;
    }

    if (successAnimationEffectKey) {
      await this.animationEffect.sendAnimationEventToCharacter(character, successAnimationEffectKey, targetItem._id);
    }

    await targetItem.remove();

    if (successMessages) {
      this.sendRandomMessageToCharacter(character, successMessages, true);
    }

    await skillIncrease.increaseCraftingSP(character, ItemType.Plant, true);
  }

  private isOwner(plant: IItem, character: ICharacter): boolean {
    return plant.owner?.toString() === character._id.toString();
  }

  private sendRandomMessageToCharacter(character: ICharacter, randomMessages: string[], isSuccess: boolean): void {
    if (isSuccess) {
      this.socketMessaging.sendMessageToCharacter(character, randomMessages[random(0, randomMessages.length - 1)]);
    } else {
      this.socketMessaging.sendErrorMessageToCharacter(character, randomMessages[random(0, randomMessages.length - 1)]);
    }
  }
}
