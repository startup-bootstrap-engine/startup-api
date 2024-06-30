import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { EntityEffectApplier } from "@providers/entityEffects/EntityEffectApplier";
import { container } from "@providers/inversify/container";
import { AnimationEffectKeys } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { EntityEffectBlueprint } from "../types/entityEffectBlueprintTypes";
import { IEntityEffect } from "./entityEffect";

export const entityEffectPoison: IEntityEffect = {
  key: EntityEffectBlueprint.Poison,
  totalDurationMs: 60000,
  intervalMs: 5000,
  probability: 20, // 20% chance of triggering it for the NPC that attacks a target
  targetAnimationKey: AnimationEffectKeys.HitPoison,
  type: EntityAttackType.Melee,
  effect: async (target: ICharacter | INPC, attacker: ICharacter | INPC) => {
    const entityEffectApplier = container.get(EntityEffectApplier);

    return await entityEffectApplier.applyEffectDamage(target, attacker);
  },
};
