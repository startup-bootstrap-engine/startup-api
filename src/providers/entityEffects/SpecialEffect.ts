import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { TimerWrapper } from "@providers/helpers/TimerWrapper";
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
    target: ICharacter | INPC,
    intervalSec: number,
    namespace: SpecialEffectNamespace,
    onEffectEnd?: Function
  ): Promise<boolean> {
    const entityType = target?.type as EntityType;
    if (entityType === EntityType.Item) {
      return false;
    }

    const isApplied = await this.isEffectApplied(target, namespace);
    if (isApplied) {
      return false;
    }

    await this.inMemoryHashTable.set(namespace, this.getEntityKey(target), true);

    this.timer.setTimeout(async () => {
      await this.inMemoryHashTable.delete(namespace, this.getEntityKey(target));
      onEffectEnd && onEffectEnd();
    }, intervalSec * 1000);

    return true;
  }

  @TrackNewRelicTransaction()
  public async removeEffect(target: ICharacter | INPC, namespace: SpecialEffectNamespace): Promise<boolean> {
    const isApplied = await this.isEffectApplied(target, namespace);
    if (!isApplied) {
      return false;
    }

    await this.inMemoryHashTable.delete(namespace, this.getEntityKey(target));

    return true;
  }

  public async isEffectApplied(target: ICharacter | INPC, namespace: SpecialEffectNamespace): Promise<boolean> {
    const value = await this.inMemoryHashTable.get(namespace, this.getEntityKey(target));
    return !!value;
  }

  public getEntityKey(target: ICharacter | INPC): string {
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
      return;
    }

    await this.inMemoryHashTable.delete(SpecialEffectNamespace.Stealth, this.getEntityKey(target));
  }
}
