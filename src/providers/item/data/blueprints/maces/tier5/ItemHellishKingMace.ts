import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
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
import { IEquippableTwoHandedTier5WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemHellishKingMace: IEquippableTwoHandedTier5WeaponBlueprint = {
  key: MacesBlueprint.HellishKingMace,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/hellish-king-mace.png",
  name: "Hellish King Mace",
  description: "The Hellish King Mace is a heavy, two-handed weapon that excels at dealing massive amounts of damage",
  weight: 2.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 90,
  defense: 37,
  tier: 5,
  isTwoHanded: true,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 70,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases max health by 6%, strength by 6% and resistance by 6%.",
};
