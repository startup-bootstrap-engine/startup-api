import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemEmberstrikeAxe: IEquippableMeleeTier14WeaponBlueprint = {
  key: AxesBlueprint.EmberstrikeAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/emberstrike-axe.png",
  name: "Emberstrike Axe",
  description: "A fiery axe that scorches foes with each strike.",
  weight: 4.8,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 105,
  defense: 104,
  tier: 14,
  rangeType: EntityAttackType.Melee,
  basePrice: 130,

  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 90,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 16,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 16,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 16,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 16,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription:
    "Increases Max Health by 20%, Max Mana by 20%, Magic by 16%, Magic Resistance by 16%, Resistance by 16%, and Strength by 16%.",
};
