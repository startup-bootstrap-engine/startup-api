import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { SPELL_AREA_MEDIUM_BLAST_RADIUS } from "@providers/constants/SpellConstants";
import { entityEffectBurning } from "@providers/entityEffects/data/blueprints/entityEffectBurning";
import { container } from "@providers/inversify/container";
import { SpellArea } from "@providers/spells/area-spells/SpellArea";
import { AnimationEffectKeys, MagicPower } from "@rpg-engine/shared";
import { IUsableEffectRune, UsableEffectsBlueprint } from "../types";

export const bombUsableEffect: IUsableEffectRune = {
  key: UsableEffectsBlueprint.BombUsableEffect,
  usableEffect: async (caster: ICharacter, target: ICharacter | INPC) => {
    const spellArea = container.get(SpellArea);

    await spellArea.cast(caster, target, MagicPower.Fatal + MagicPower.Medium, {
      effectAnimationKey: AnimationEffectKeys.HitFire,
      entityEffect: entityEffectBurning,
      spellAreaGrid: SPELL_AREA_MEDIUM_BLAST_RADIUS,
    });

    return true;
  },
  usableEffectDescription: "Delivers a bomb to the target",
};
