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

export const spellEntanglingRoots: Partial<ISpell> = {
  key: SpellsBlueprint.EntanglingRoots,
  name: "Entangling Roots",
  description: "Stun your enemy by manipulating the primal forces of nature",
  textureAtlas: "icons",
  texturePath: "spell-icons/entangling-roots.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "raithin-nodrim",
  manaCost: 40,
  minLevelRequired: 4,
  minMagicLevelRequired: 8,
  cooldown: 15,
  castingAnimationKey: AnimationEffectKeys.SkillLevelUp,
  targetHitAnimationKey: AnimationEffectKeys.Rooted,
  projectileAnimationKey: AnimationEffectKeys.Energy,
  maxDistanceGrid: RangeTypes.High,
  characterClass: [CharacterClass.Druid],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const spellCalculator = container.get(SpellCalculator);

    const stun = container.get(Stun);

    const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 5,
      max: 10,
    });

    await stun.execStun(character, target, timeout);

    return true;
  },
};
