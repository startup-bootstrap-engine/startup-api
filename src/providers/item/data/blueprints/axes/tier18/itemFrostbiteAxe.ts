import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier18WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemFrostbiteAxe: IEquippableMeleeTier18WeaponBlueprint = {
  key: AxesBlueprint.FrostbiteAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/frostbite-axe.png",
  name: "Frostbite Axe",
  description: "An icy axe that chills the bones of its victims.",
  weight: 4.6,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 130,
  defense: 124,
  tier: 18,
  rangeType: EntityAttackType.Melee,
  basePrice: 155,
  entityEffects: [EntityEffectBlueprint.Corruption],
  entityEffectChance: 94,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 30,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 30,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 26,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 26,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 26,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 26,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription:
    "Increases Max Health by 30%, Max Mana by 30%, Magic by 26%, Magic Resistance by 26%, Resistance by 26%, and Strength by 26%.",
};
