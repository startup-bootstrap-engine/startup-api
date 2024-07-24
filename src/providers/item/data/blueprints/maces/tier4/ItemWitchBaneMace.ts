import { IEquippableTwoHandedTier4WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";

export const itemWitchBaneMace: IEquippableTwoHandedTier4WeaponBlueprint = {
  key: MacesBlueprint.WitchBaneMace,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/witch-bane-mace.png",
  name: "Witch Bane Mace",
  description: "Designed for witch-hunting, this mace is highly effective against magical creatures and spellcasters.",
  weight: 4.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 62,
  defense: 36,
  tier: 4,
  isTwoHanded: true,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 90,

  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases max health by 5%, strength by 5% and resistance by 5%.",
};
