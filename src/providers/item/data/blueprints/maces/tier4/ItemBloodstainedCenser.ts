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
import { IEquippableMeleeTier4WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { MacesBlueprint } from "../../../types/itemsBlueprintTypes";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";

export const itemBloodstainedCenser: IEquippableMeleeTier4WeaponBlueprint = {
  key: MacesBlueprint.BloodstainedCenser,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "maces/bloodstained-censer.png",
  name: "Bloodstained Censer",
  description:
    "A mace with a brown wooden handle and a head that is shaped like a cross, made of brass or bronze and adorned with blood-red gems or crystals.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 30,
  defense: 20,
  tier: 4,
  rangeType: EntityAttackType.Melee,
  basePrice: 70,
  entityEffects: [EntityEffectBlueprint.Bleeding],
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
