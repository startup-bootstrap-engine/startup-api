import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { HitTargetQueue } from "@providers/battle/HitTargetQueue";
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

export const spellShieldBash: Partial<ISpell> = {
  key: SpellsBlueprint.ShieldBash,
  name: "Shield Bash",
  description: "A warrior's shield bash to damage the enemy and debuff their resistance.",
  textureAtlas: "icons",
  texturePath: "spell-icons/shield-bash.png",
  castingType: SpellCastingType.RangedCasting,
  magicWords: "turin rista",
  manaCost: 40,
  minLevelRequired: 5,
  minMagicLevelRequired: 5,
  cooldown: 60,
  targetHitAnimationKey: AnimationEffectKeys.LevelUp,
  castingAnimationKey: AnimationEffectKeys.LevelUp,
  projectileAnimationKey: AnimationEffectKeys.Dark,
  maxDistanceGrid: RangeTypes.Short,
  characterClass: [CharacterClass.Warrior],

  usableEffect: async (character: ICharacter, target: ICharacter | INPC) => {
    const socketMessaging = container.get(SocketMessaging);
    const spellCalculator = container.get(SpellCalculator);
    const characterBuffActivator = container.get(CharacterBuffActivator);
    const hitTarget = container.get(HitTargetQueue);

    if (target.type === "NPC") {
      socketMessaging.sendErrorMessageToCharacter(character, "You can't use Shield Bash on a NPC.");
      return false;
    }

    const damage = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Strength, {
      min: 5,
      max: 20,
    });

    await hitTarget.hit(character, target, true, damage, true);

    const debuffPercentage = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Strength, {
      min: 10,
      max: 60,
    });

    const timeout = await spellCalculator.calculateBasedOnSkillLevel(character, BasicAttribute.Strength, {
      min: 15,
      max: 60,
    });

    await characterBuffActivator.enableTemporaryBuff(target as ICharacter, {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: -debuffPercentage,
      durationSeconds: timeout,
      durationType: CharacterBuffDurationType.Temporary,
      options: {
        messages: {
          activation: `💥 Shield Bash has hit you! Your resistance decreases by -${debuffPercentage}%`,
          deactivation: "💥 The effects of Shield Bash have subsided. Your resistance has returned to normal.",
        },
      },
      isStackable: false,
      originateFrom: SpellsBlueprint.ShieldBash + "-" + BasicAttribute.Resistance,
    });

    return true;
  },
};
