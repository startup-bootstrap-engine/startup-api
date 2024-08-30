import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemIronstormAxe: IEquippableMeleeTier16WeaponBlueprint = {
  key: AxesBlueprint.IronstormAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/ironstorm-axe.png",
  name: "Ironstorm Axe",
  description: "A heavy axe that strikes with the force of a storm.",
  weight: 5.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 115,
  defense: 115,
  tier: 16,
  rangeType: EntityAttackType.Melee,
  basePrice: 140,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 97,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 25,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 25,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription:
    "Increases Max Health by 25%, Max Mana by 25%, Magic by 20%, Magic Resistance by 20%, Resistance by 20%, and Strength by 20%.",
};
