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
  UserAccountTypes,
} from "@rpg-engine/shared";
import { SpellLifeSteal } from "../../logic/other/SpellLifeSteal/SpellLifeSteal";

export const spellVampiricStorm: Partial<ISpell> = {
  key: SpellsBlueprint.VampiricStorm,
  name: "Vampiric Storm",
  description:
    "This dark vortex drains the life essence of enemies caught within its pull, simultaneously restoring the health of the caster.",
  textureAtlas: "icons",
  texturePath: "spell-icons/vampiric-storm.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "sanguis tempestas nox",
  manaCost: 120,
  minLevelRequired: 12,
  minMagicLevelRequired: 8,
  cooldown: 30,
  castingAnimationKey: AnimationEffectKeys.LifeHeal,
  targetHitAnimationKey: AnimationEffectKeys.Hit,
  projectileAnimationKey: AnimationEffectKeys.Red,
  maxDistanceGrid: RangeTypes.High,
  characterClass: [CharacterClass.Druid],

  onlyPremiumAccountType: [
    UserAccountTypes.PremiumBronze,
    UserAccountTypes.PremiumSilver,
    UserAccountTypes.PremiumGold,
    UserAccountTypes.PremiumUltimate,
  ],

  usableEffect: async (caster: ICharacter | INPC, target: ICharacter | INPC) => {
    const spellArea = container.get(SpellArea);

    const spellLifeSteal = container.get(SpellLifeSteal);

    await spellArea.cast(caster, target, MagicPower.Medium, {
      effectAnimationKey: AnimationEffectKeys.Lifedrain,
      entityEffect: entityEffectBleeding,
      spellAreaGrid: SPELL_AREA_MEDIUM_BLAST_RADIUS,
      customFn: async (target: ICharacter | INPC) => {
        await spellLifeSteal.performLifeSteal(caster, target);
      },
    });

    return true;
  },
};
