import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { NPC_MAX_STUN_LEVEL } from "@providers/constants/NPCConstants";
import { container } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterClass,
  EntityType,
  ISkill,
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

    const socketMessaging = container.get(SocketMessaging);

    const targetSkills = (await Skill.findOne({
      owner: target?._id,
    })
      .lean()
      .cacheQuery({
        cacheKey: `${target?._id}-skills`,
      })) as unknown as ISkill;

    if (target.type === EntityType.NPC && targetSkills?.level! > NPC_MAX_STUN_LEVEL) {
      socketMessaging.sendErrorMessageToCharacter(character, "This target is immune to stun effects.");
      return false;
    }

    const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 5,
      max: 10,
    });

    await stun.execStun(character, target, timeout);

    return true;
  },
};
