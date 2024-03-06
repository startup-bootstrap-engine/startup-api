import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier10WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemDarkmoonDagger: IEquippableMeleeTier10WeaponBlueprint = {
  key: DaggersBlueprint.DarkmoonDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/darkmoon-dagger.png",
  name: "Darkmoon Dagger",
  description: "Black blade, spooky light, hidden in shadows, a secret weapon for sneaky, deadly tasks.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 77,
  defense: 72,
  tier: 10,
  rangeType: EntityAttackType.Melee,
  basePrice: 110,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 100,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+8% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-8% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Dagger,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dagger flowing through your body. (+8% dagger)",
          deactivation: "You feel the power of dagger leaving your body. (-8% dagger)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Dexterity,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dexterity flowing through your body. (+7% dexterity)",
          deactivation: "You feel the power of dexterity leaving your body. (-7% dexterity)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 8%, dagger by 8% and dexterity by 7% respectively",
};
