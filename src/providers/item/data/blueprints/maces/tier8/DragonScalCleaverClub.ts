import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier8WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemDragonScalCleaverClub: IEquippableMeleeTier8WeaponBlueprint = {
  key: MacesBlueprint.DragonScalCleaverClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/dragonscale-cleaver-club.png",
  name: "Dragon Scal Cleaver Club",
  description: "Dragonscale Cleaver emphasizes its remarkable effectiveness against even the toughest scales.",
  weight: 4.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 62,
  defense: 54,
  tier: 8,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 85,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases max health by 10%, strength by 10% and resistance by 9%.",
};
