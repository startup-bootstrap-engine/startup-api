import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { TimerWrapper } from "@providers/helpers/TimerWrapper";
import { npcManager } from "@providers/inversify/container";
import { EntityType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

export enum SpecialEffectNamespace {
  Stun = "character-special-effect-stun",
  Stealth = "character-special-effect-stealth",
}

@provide(SpecialEffect)
export class SpecialEffect {
  constructor(private inMemoryHashTable: InMemoryHashTable, private timer: TimerWrapper) {}

  @TrackNewRelicTransaction()
  public async applyEffect(
    caster: ICharacter,
    target: ICharacter | INPC,
    intervalSec: number,
    namespace: SpecialEffectNamespace,
    onEffectEnd?: Function
  ): Promise<boolean> {
    if (!target) {
      throw new Error("applyEffect: target is null or undefined");
    }

    const entityType = target.type as EntityType;
    if (entityType === EntityType.Item) {
      return false;
    }

    const isApplied = await this.isEffectApplied(target, namespace);
    if (isApplied) {
      return false;
    }

    await this.inMemoryHashTable.set(namespace, this.getEntityKey(target), true);

    this.timer.setTimeout(async () => {
      if (!target) {
        return;
      }

      await this.inMemoryHashTable.delete(namespace, this.getEntityKey(target));

      if (namespace === SpecialEffectNamespace.Stun || namespace === SpecialEffectNamespace.Stealth) {
        if (appEnv.general.IS_UNIT_TEST) {
          return;
        }
        await npcManager.startNearbyNPCsBehaviorLoop(caster);
      }

      if (onEffectEnd) {
        onEffectEnd();
      }
    }, intervalSec * 1000);

    return true;
  }

  @TrackNewRelicTransaction()
  public async removeEffect(target: ICharacter | INPC, namespace: SpecialEffectNamespace): Promise<boolean> {
    if (!target) {
      throw new Error("removeEffect: target is null or undefined");
    }

    const isApplied = await this.isEffectApplied(target, namespace);
    if (!isApplied) {
      return false;
    }

    await this.inMemoryHashTable.delete(namespace, this.getEntityKey(target));

    if (target.type === EntityType.Character) {
      await npcManager.startNearbyNPCsBehaviorLoop(target as ICharacter);
    }

    return true;
  }

  public async isEffectApplied(target: ICharacter | INPC, namespace: SpecialEffectNamespace): Promise<boolean> {
    if (!target) {
      throw new Error("isEffectApplied: target is null or undefined");
    }

    const value = await this.inMemoryHashTable.get(namespace, this.getEntityKey(target));
    return !!value;
  }

  public getEntityKey(target: ICharacter | INPC): string {
    if (!target) {
      throw new Error("getEntityKey: target is null or undefined");
    }

    const entityType = target.type as EntityType;
    const entityId = target._id;

    const key = [entityType, entityId].join(":");
    return key;
  }

  @TrackNewRelicTransaction()
  public async cleanup(): Promise<void> {
    await this.inMemoryHashTable.deleteAll(SpecialEffectNamespace.Stun);
    await this.inMemoryHashTable.deleteAll(SpecialEffectNamespace.Stealth);
  }

  @TrackNewRelicTransaction()
  async clearEffects(target: ICharacter | INPC): Promise<void> {
    if (!target) {
      throw new Error("clearEffects: target is null or undefined");
    }

    await this.inMemoryHashTable.delete(SpecialEffectNamespace.Stealth, this.getEntityKey(target));
  }
}
