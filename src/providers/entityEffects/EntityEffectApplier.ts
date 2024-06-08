import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { EffectableAttribute, ItemUsableEffect } from "@providers/item/helper/ItemUsableEffect";
import { ManaShield } from "@providers/spells/data/logic/mage/ManaShield";
import { EntityType, MagicPower } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CalculateEffectDamage } from "./CalculateEffectDamage";

@provide(EntityEffectApplier)
export class EntityEffectApplier {
  constructor(
    private itemUsableEffect: ItemUsableEffect,
    private calculateEffectDamage: CalculateEffectDamage,
    private manaShield: ManaShield
  ) {}

  public async applyEffectDamage(
    target: ICharacter | INPC,
    attacker: ICharacter | INPC,
    power?: MagicPower
  ): Promise<number> {
    const effectDamage = await this.calculateEffectDamage.calculateEffectDamage(attacker, target, {
      maxBonusDamage: power,
    });

    if (target.type === EntityType.Character) {
      const hasManaShield = await this.manaShield.hasManaShield(target as ICharacter);

      if (hasManaShield) {
        await this.manaShield.handleManaShield(target as ICharacter, effectDamage);
        return effectDamage;
      }
    }

    await this.itemUsableEffect.apply(target, EffectableAttribute.Health, -1 * effectDamage);

    return effectDamage;
  }
}
