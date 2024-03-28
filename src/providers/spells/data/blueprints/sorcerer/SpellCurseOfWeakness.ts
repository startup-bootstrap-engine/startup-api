import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import { container } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  AnimationEffectKeys,
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  CharacterClass,
  ISpell,
  RangeTypes,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { SpellCalculator } from "../../abstractions/SpellCalculator";

export const spellCurseOfWeakness: Partial<ISpell> = {
  key: SpellsBlueprint.CurseOfWeakness,
  name: "Curse of Weakness",
  description: "A sorcerer's spell designed to reduce the strength and resistance of a target.",
  textureAtlas: "icons",
  texturePath: "spell-icons/curse-of-weakness.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "dhagnir-lûth",
  manaCost: 60,
  minLevelRequired: 10,
  minMagicLevelRequired: 10,
  cooldown: 120,
  targetHitAnimationKey: AnimationEffectKeys.Corruption,
  castingAnimationKey: AnimationEffectKeys.LevelUp,
  projectileAnimationKey: AnimationEffectKeys.Dark,
  maxDistanceGrid: RangeTypes.Medium,
  characterClass: [CharacterClass.Sorcerer],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const socketMessaging = container.get(SocketMessaging);
    const spellCalculator = container.get(SpellCalculator);
    const characterBuffActivator = container.get(CharacterBuffActivator);

    if (target.type === "NPC") {
      socketMessaging.sendErrorMessageToCharacter(character, "You can't cast this spell on a NPC.");
      return false;
    }

    const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 10,
      max: 30,
    });

    const buffPercentage = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Magic, {
      min: 10,
      max: 30,
    });

    await characterBuffActivator.enableTemporaryBuff(target as ICharacter, {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: -buffPercentage,
      durationSeconds: timeout,
      durationType: CharacterBuffDurationType.Temporary,
      options: {
        messages: {
          activation: `💀 You're cursed! Your strength and weakness fell by -${buffPercentage}%`,
          deactivation: "💀 You're no longer cursed! Your strength and weakness are back to normal.",
        },
      },
      isStackable: false,
      originateFrom: SpellsBlueprint.CurseOfWeakness + "-" + BasicAttribute.Strength,
    });

    await characterBuffActivator.enableTemporaryBuff(target as ICharacter, {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: -buffPercentage,
      durationSeconds: timeout,
      durationType: CharacterBuffDurationType.Temporary,
      options: {
        messages: {
          skipAllMessages: true,
        },
      },
      isStackable: false,
      originateFrom: SpellsBlueprint.CurseOfWeakness + "-" + BasicAttribute.Resistance,
    });

    return true;
  },
};
