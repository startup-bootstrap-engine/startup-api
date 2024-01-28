import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";

import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { container } from "@providers/inversify/container";
import { PlantGrowth } from "@providers/plant/PlantGrowth";
import { IRefillableItem } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import _, { random } from "lodash";
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
  errorMessages?: string[];
  successMessages?: string[];
}

@provide(UseWithRefill)
export class UseWithRefill {
  constructor(
    private socketMessaging: SocketMessaging,
    private movementHelper: MovementHelper,
    private plantGrowth: PlantGrowth
  ) {}

  public async executeUse(character: ICharacter, options: IUseWithRefill, skillIncrease: SkillIncrease): Promise<void> {
    const { targetItem, originItem, decrementQty, targetType, successMessages, errorMessages } = options;

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
        this.socketMessaging.sendErrorMessageToCharacter(character, `Sorry, Please refill your ${resourceKey}.`);
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
          `Sorry, You can only ${resourceKey} that you own ${targetType}s.`
        );
        return;
      }

      const chance = 50; // 50% chance
      const n = _.random(0, 100);

      if (n >= chance) {
        if (errorMessages) {
          this.sendRandomMessageToCharacter(character, errorMessages, false);
        }
        return;
      }

      let isSuccess = false;

      if (resourceKey === "water") {
        isSuccess = await this.plantGrowth.updatePlantGrowth(targetItem, character);
      }

      if (isSuccess) {
        originItem.remainingUses -= decrementQty ?? 1;

        await originItem.save();

        if (successMessages) {
          this.sendRandomMessageToCharacter(character, successMessages, true);
        }
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
    const { originItem, errorMessages, successMessages } = options;

    try {
      const chance = 50;
      const n = _.random(0, 100);
      if (n >= chance) {
        if (errorMessages) {
          this.sendRandomMessageToCharacter(character, errorMessages, false);
        }
        return;
      }

      const blueprintManager = container.get<BlueprintManager>(BlueprintManager);

      const blueprintRefill = (await blueprintManager.getBlueprint("items", originItem?.baseKey!)) as IRefillableItem;

      if (!blueprintRefill) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, the blueprint could not be found.");
        return;
      }

      const initialRemainingUses = blueprintRefill.initialRemainingUses;

      if (originItem.remainingUses !== initialRemainingUses) {
        originItem.remainingUses = initialRemainingUses;
        await originItem.save();
      }

      if (successMessages) {
        this.sendRandomMessageToCharacter(character, successMessages, true);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
