import { IEquippableMeleeTier7WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemMetalMasherClub: IEquippableMeleeTier7WeaponBlueprint = {
  key: MacesBlueprint.MetalMasherClub,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/metal-masher-club.png",
  name: "Metal Masher Club",
  description: "Metal Masher emphasizes the weapon's proficiency in crushing and pulverizing.",
  weight: 4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 57,
  defense: 40,
  tier: 7,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 90,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases max health by 9%, strength by 8% and resistance by 8%.",
};
