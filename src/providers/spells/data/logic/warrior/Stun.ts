import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { SpecialEffect, SpecialEffectNamespace } from "@providers/entityEffects/SpecialEffect";
import { provide } from "inversify-binding-decorators";

@provide(Stun)
export class Stun {
  constructor(private specialEffect: SpecialEffect) {}

  @TrackNewRelicTransaction()
  async execStun(caster: ICharacter, target: ICharacter | INPC, intervalSec: number): Promise<boolean> {
    return await this.specialEffect.applyEffect(caster, target, intervalSec, SpecialEffectNamespace.Stun);
  }

  @TrackNewRelicTransaction()
  async isStun(target: ICharacter | INPC): Promise<boolean> {
    return await this.specialEffect.isEffectApplied(target, SpecialEffectNamespace.Stun);
  }
}
