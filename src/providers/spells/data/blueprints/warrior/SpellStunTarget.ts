import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { container } from "@providers/inversify/container";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterClass,
  ISpell,
  RangeTypes,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { SpellCalculator } from "../../abstractions/SpellCalculator";
import { Stun } from "../../logic/warrior/Stun";

export const spellStunTarget: Partial<ISpell> = {
  key: SpellsBlueprint.WarriorStunTarget,
  name: "Stun",
  description: "A spell designed for a warrior to stun a target in battle.",
  textureAtlas: "icons",
  texturePath: "spell-icons/warrior-stun-target.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "talas tamb-eth",
  manaCost: 50,
  minLevelRequired: 4,
  minMagicLevelRequired: 8,
  isPVPOnly: true,
  cooldown: 40,
  castingAnimationKey: AnimationEffectKeys.SkillLevelUp,
  targetHitAnimationKey: AnimationEffectKeys.Rooted,
  projectileAnimationKey: AnimationEffectKeys.Energy,
  maxDistanceGrid: RangeTypes.Medium,
  characterClass: [CharacterClass.Warrior, CharacterClass.Rogue, CharacterClass.Berserker],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const spellCalculator = container.get(SpellCalculator);

    const stun = container.get(Stun);

    const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 10,
      max: 20,
    });

    await stun.execStun(target, timeout);

    return true;
  },
};
