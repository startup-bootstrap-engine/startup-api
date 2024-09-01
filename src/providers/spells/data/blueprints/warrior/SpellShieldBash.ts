import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
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
  EntityType,
  ISpell,
  RangeTypes,
  SpellCastingType,
  SpellsBlueprint,
} from "@rpg-engine/shared";
import { clearCacheForKey } from "speedgoose";
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

    switch (target.type) {
      case EntityType.Character:
        await applyCharacterDebuff(target as ICharacter, characterBuffActivator, debuffPercentage, timeout);
        break;
      case EntityType.NPC:
        await applyNPCDebuff(character, target as INPC, debuffPercentage, timeout, socketMessaging);
        break;
      default:
        socketMessaging.sendErrorMessageToCharacter(character, "Invalid target for Shield Bash.");
        return false;
    }

    return true;
  },
};

async function applyCharacterDebuff(
  target: ICharacter,
  characterBuffActivator: CharacterBuffActivator,
  debuffPercentage: number,
  timeout: number
): Promise<void> {
  await characterBuffActivator.enableTemporaryBuff(target, {
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
}

async function applyNPCDebuff(
  caster: ICharacter,
  target: INPC,
  debuffPercentage: number,
  timeout: number,
  socketMessaging: SocketMessaging
): Promise<void> {
  const npcSkills = await Skill.findOne({ owner: target._id, ownerType: EntityType.NPC }).lean();
  if (npcSkills) {
    const currentResistance = npcSkills.resistance.level;
    const newResistance = Math.max(1, Math.floor(currentResistance * (1 - debuffPercentage / 100)));

    await Skill.updateOne(
      { _id: npcSkills._id },
      {
        $set: { "resistance.level": newResistance },
      }
    );

    // Send message about NPC resistance reduction
    socketMessaging.sendMessageToCharacter(
      caster,
      `💥 Shield Bash has hit ${target.name}! Its resistance decreases by ${debuffPercentage}%`
    );

    await clearCacheForKey(`${target._id}-skills`);

    setTimeout(async () => {
      await Skill.updateOne(
        { _id: npcSkills._id },
        {
          $set: { "resistance.level": currentResistance },
        }
      );

      await clearCacheForKey(`${target._id}-skills`);

      // Send message about NPC resistance restoration
      socketMessaging.sendMessageToCharacter(
        caster,
        `The effects of Shield Bash on ${target.name} have subsided. Its resistance has returned to normal.`
      );
    }, timeout * 1000);
  }
}
