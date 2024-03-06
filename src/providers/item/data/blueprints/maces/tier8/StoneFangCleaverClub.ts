import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier8WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemStoneFangCleaverClub: IEquippableMeleeTier8WeaponBlueprint = {
  key: MacesBlueprint.StonefangCleaverClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/stonefang-cleaver-club.png",
  name: "Stonefang Cleaver Club",
  description: "Infused with ferocity, this weapon is designed to deliver devastating blows with unrivaled force.",
  weight: 4.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 58,
  defense: 52,
  tier: 8,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 90,
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.MaxHealth,
    buffPercentage: 4,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of max health flowing through your body. (+4% MaxHealth)",
        deactivation: "You feel the power of max health leaving your body. (-4% MaxHealth)",
      },
    },
  },
  equippedBuffDescription: "Increases max health by 4% respectively",
};
