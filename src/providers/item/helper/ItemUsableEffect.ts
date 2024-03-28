import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { Locker } from "@providers/locks/Locker";
import { EntityType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

export enum EffectableMaxAttribute {
  Health = "maxHealth",
  Mana = "maxMana",
}

export enum EffectableAttribute {
  Health = "health",
  Mana = "mana",
  Speed = "speed",
}

@provide(ItemUsableEffect)
export class ItemUsableEffect {
  constructor(private locker: Locker) {}

  @TrackNewRelicTransaction()
  public async apply(target: ICharacter | INPC, attr: EffectableAttribute, value: number): Promise<void> {
    try {
      const canProceed = await this.locker.lock(`${target._id}-applying-usable-effect`);

      if (!canProceed) {
        return;
      }

      this.validateTargetAndValue(target, value);

      const updateObj: any = this.calculateAttributeUpdate(target, attr, value);

      await this.updateEntity(target, updateObj);
    } catch (error) {
      console.error("Failed to update entity:", error);
      throw error;
    } finally {
      await this.locker.unlock(`${target._id}-applying-usable-effect`);
    }
  }

  private validateTargetAndValue(target: ICharacter | INPC, value: number): void {
    if (!target) {
      throw new Error("Invalid target: target must be a valid entity");
    }
    if (isNaN(value)) {
      throw new Error("Invalid value: value must be a number");
    }
  }

  private calculateAttributeUpdate(target: ICharacter | INPC, attr: EffectableAttribute, value: number): any {
    const updateObj: any = {};
    target[attr] += value;

    switch (attr) {
      case EffectableAttribute.Health:
      case EffectableAttribute.Mana:
        this.updateHealthOrMana(target, attr, updateObj);
        break;
      case EffectableAttribute.Speed:
        this.updateSpeed(target as ICharacter, value, updateObj);
        break;
      default:
        break;
    }

    return updateObj;
  }

  private updateHealthOrMana(target: ICharacter | INPC, attr: EffectableAttribute, updateObj: any): void {
    const maxAttr = attr === EffectableAttribute.Health ? EffectableMaxAttribute.Health : EffectableMaxAttribute.Mana;
    target[attr] = Math.max(0, Math.min(target[attr], target[maxAttr]));
    updateObj[attr] = target[attr];
  }

  private updateSpeed(target: ICharacter, value: number, updateObj: any): void {
    if (target.baseSpeed === MovementSpeed.Slow || target.baseSpeed === MovementSpeed.ExtraSlow) {
      target.baseSpeed = value;
    }
    updateObj.baseSpeed = target.baseSpeed;
  }

  private async updateEntity(target: ICharacter | INPC, updateObj: any): Promise<void> {
    const model = target.type === EntityType.Character ? Character : NPC;
    await model.updateOne({ _id: target._id }, { $set: updateObj });
  }

  @TrackNewRelicTransaction()
  public async applyEatingEffect(character: ICharacter, increase: number): Promise<void> {
    await this.apply(character, EffectableAttribute.Health, increase);
    await this.apply(character, EffectableAttribute.Mana, increase);
  }
}
