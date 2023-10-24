import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { SPELL_AREA_MEDIUM_BLAST_RADIUS } from "@providers/constants/SpellConstants";
import { container } from "@providers/inversify/container";
import { SpellArea } from "@providers/spells/area-spells/SpellArea";
import {
  AnimationEffectKeys,
  CharacterClass,
  EntityType,
  ISpell,
  MagicPower,
  RangeTypes,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { SpellHeal } from "../../abstractions/SpellHeal";

export const spellMassHealing: Partial<ISpell> = {
  key: SpellsBlueprint.MassHealing,
  name: "Mass Healing",
  description: "Invokes a sacred area, rapidly restoring health to all allies within its radiant bounds.",
  textureAtlas: "icons",
  texturePath: "spell-icons/mass-healing.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "vanyarosta coirea",
  manaCost: 200,
  minLevelRequired: 20,
  minMagicLevelRequired: 15,
  cooldown: 40,
  castingAnimationKey: AnimationEffectKeys.SkillLevelUp,
  targetHitAnimationKey: AnimationEffectKeys.Holy,
  projectileAnimationKey: AnimationEffectKeys.Green,
  maxDistanceGrid: RangeTypes.High,
  characterClass: [CharacterClass.Druid],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const spellArea = container.get(SpellArea);

    await spellArea.cast(character, target, MagicPower.Medium, {
      effectAnimationKey: AnimationEffectKeys.Heal,
      spellAreaGrid: SPELL_AREA_MEDIUM_BLAST_RADIUS,
      includeCaster: true,
      isAttackSpell: false,
      excludeEntityTypes: [EntityType.NPC],
      customFn: async (target: ICharacter | INPC) => {
        const spellHeal = container.get(SpellHeal);

        await spellHeal.healTarget(character, target, {
          min: 10,
          max: 50,
        });
      },
    });

    return true;
  },
};
