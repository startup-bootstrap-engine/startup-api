import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { MovementSpeed } from "@providers/constants/MovementConstants";
import { Locker } from "@providers/locks/Locker";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { Time } from "@providers/time/Time";
import { CharacterSocketEvents, EntityType, ICharacterAttributeChanged } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import random from "lodash/random";

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
  constructor(private locker: Locker, private time: Time, private socketMessaging: SocketMessaging) {}

  @TrackNewRelicTransaction()
  public async apply(target: ICharacter | INPC, attr: EffectableAttribute, value: number): Promise<void> {
    try {
      if (!target || (target.type !== EntityType.Character && target.type !== EntityType.NPC)) {
        this.socketMessaging.sendErrorMessageToCharacter(target as ICharacter, "Sorry, not possible.");
        return;
      }

      await this.time.waitForMilliseconds(random(10, 20)); // add artificial delay to avoid concurrency

      const canProceed = await this.locker.lock(`${target._id}-applying-usable-effect`);

      if (!canProceed) {
        return;
      }

      this.ensureTargetType(target);

      const latestTargetHealth = await this.fetchLatestHealth(target);

      if (!latestTargetHealth) {
        return;
      }

      if (target.health !== latestTargetHealth) {
        target.health = latestTargetHealth;
      }

      this.validateTargetAndValue(target, value);

      const updateObj: any = this.calculateAttributeUpdate(target, attr, value);

      await this.updateEntity(target, updateObj);

      if (target.type === EntityType.NPC) {
        await this.sendNPCAttributeChangedEvent(target as INPC, attr, updateObj[attr]);
      }
    } catch (error) {
      console.error("Failed to update entity:", error);
      throw error;
    } finally {
      await this.locker.unlock(`${target._id}-applying-usable-effect`);
    }
  }

  private async sendNPCAttributeChangedEvent(
    target: INPC,
    attribute: EffectableAttribute,
    updatedAttribute: number
  ): Promise<void> {
    const payload: ICharacterAttributeChanged = {
      targetId: target._id,
      [attribute]: updatedAttribute,
    };

    await this.socketMessaging.sendEventToCharactersAroundNPC(target, CharacterSocketEvents.AttributeChanged, payload);
  }

  private async fetchLatestHealth(target: ICharacter | INPC): Promise<number | undefined> {
    try {
      let data;
      switch (target.type) {
        case EntityType.Character:
          data = await Character.findOne({ _id: target._id, scene: target.scene }).lean().select("health");
          break;
        case EntityType.NPC:
          data = await NPC.findOne({ _id: target._id, scene: target.scene }).lean().select("health");
          break;
        default:
          throw new Error(`Invalid target type: ${target.type}`);
      }

      if (!data) {
        return;
      }

      return data.health;
    } catch (error) {
      console.error(`Error fetching latest health for target with ID: ${target._id}`, error);
      throw error;
    }
  }

  private ensureTargetType(target: ICharacter | INPC): void {
    if (!target.type) {
      if ("isBehaviorEnabled" in target) {
        target.type = EntityType.NPC;
      } else {
        target.type = EntityType.Character;
      }
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

  private calculateAttributeUpdate(
    target: ICharacter | INPC,
    effectableAttribute: EffectableAttribute,
    value: number
  ): any {
    const updateObj: any = {};
    target[effectableAttribute] += value;

    switch (effectableAttribute) {
      case EffectableAttribute.Health:
      case EffectableAttribute.Mana:
        this.updateHealthOrMana(target, effectableAttribute, updateObj);
        break;
      case EffectableAttribute.Speed:
        this.updateSpeed(target as ICharacter, value, updateObj);
        break;
      default:
        break;
    }

    return updateObj;
  }

  private updateHealthOrMana(
    target: ICharacter | INPC,
    effectableAttribute: EffectableAttribute,
    updateObj: any
  ): void {
    const maxAttr =
      effectableAttribute === EffectableAttribute.Health ? EffectableMaxAttribute.Health : EffectableMaxAttribute.Mana;
    target[effectableAttribute] = Math.max(0, Math.min(target[effectableAttribute], target[maxAttr]));
    updateObj[effectableAttribute] = target[effectableAttribute];
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
