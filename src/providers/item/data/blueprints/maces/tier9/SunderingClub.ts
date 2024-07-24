import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier9WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemSunderingClub: IEquippableMeleeTier9WeaponBlueprint = {
  key: MacesBlueprint.SunderingClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/sundering-club.png",
  name: "Sundering Club",
  description: "The Sundering Club evokes a potent magical object capable of immense destruction.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 71,
  defense: 60,
  tier: 9,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 95,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases max health by 12%, strength by 12% and resistance by 10%.",
};
