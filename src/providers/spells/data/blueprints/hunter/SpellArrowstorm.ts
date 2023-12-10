import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { SPELL_AREA_MEDIUM_BLAST_RADIUS } from "@providers/constants/SpellConstants";
import { entityEffectBleeding } from "@providers/entityEffects/data/blueprints/entityEffectBleeding";
import { container } from "@providers/inversify/container";
import { SpellArea } from "@providers/spells/area-spells/SpellArea";
import {
  AnimationEffectKeys,
  CharacterClass,
  ISpell,
  MagicPower,
  RangeTypes,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";

export const spellArrowStorm: Partial<ISpell> = {
  key: SpellsBlueprint.Arrowstorm,
  name: "Arrow Storm",
  description: "Unleashes a devastating barrage of enchanted arrows upon the targeted area.",
  textureAtlas: "icons",
  texturePath: "spell-icons/arrowstorm.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "vanya lóte náren",
  manaCost: 70,
  minLevelRequired: 11,
  minMagicLevelRequired: 7,
  cooldown: 10,
  castingAnimationKey: AnimationEffectKeys.SkillLevelUp,
  targetHitAnimationKey: AnimationEffectKeys.Hit,
  projectileAnimationKey: AnimationEffectKeys.Arrow,
  maxDistanceGrid: RangeTypes.High,
  characterClass: [CharacterClass.Hunter],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const spellArea = container.get(SpellArea);

    await spellArea.cast(character, target, MagicPower.Medium, {
      effectAnimationKey: AnimationEffectKeys.Execution,
      entityEffect: entityEffectBleeding,
      spellAreaGrid: SPELL_AREA_MEDIUM_BLAST_RADIUS,
    });

    return true;
  },
};
