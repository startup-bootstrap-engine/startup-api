import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { EntityEffectApplier } from "@providers/entityEffects/EntityEffectApplier";
import { container } from "@providers/inversify/container";
import { AnimationEffectKeys, MagicPower } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { EntityEffectBlueprint } from "../types/entityEffectBlueprintTypes";
import { IEntityEffect } from "./entityEffect";

export const entityEffectCorruption: IEntityEffect = {
  key: EntityEffectBlueprint.Corruption,
  totalDurationMs: 8000,
  intervalMs: 2000,
  probability: 25,
  targetAnimationKey: AnimationEffectKeys.Corruption,
  type: EntityAttackType.Melee,
  effect: async (target: ICharacter | INPC, attacker: ICharacter | INPC) => {
    const entityEffectApplier = container.get(EntityEffectApplier);

    return await entityEffectApplier.applyEffectDamage(target, attacker, MagicPower.High);
  },
};
