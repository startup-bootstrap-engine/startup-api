import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier17WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemDragonfireAxe: IEquippableMeleeTier17WeaponBlueprint = {
  key: AxesBlueprint.DragonfireAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/dragonfire-axe.png",
  name: "Dragonfire Axe",
  description: "A legendary axe imbued with the fire of a dragon.",
  weight: 5.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 124,
  defense: 120,
  tier: 17,
  rangeType: EntityAttackType.Melee,
  basePrice: 145,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 94,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 28,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 28,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 22,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 22,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 22,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 22,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription:
    "Increases Max Health by 28%, Max Mana by 28%, Magic by 22%, Magic Resistance by 22%, Resistance by 22%, and Strength by 22%.",
};
