import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRoyalChopperAxe: IEquippableMeleeTier16WeaponBlueprint = {
  key: AxesBlueprint.RoyalChopperAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/royal-chopper-axe.png",
  name: "Royal Chopper Axe",
  description: "The Ironclad Cleaver axe commands respect with its sharp, imposing presence.",
  weight: 5.8,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 120,
  defense: 118,
  tier: 16,
  rangeType: EntityAttackType.Melee,
  basePrice: 144,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 90,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 6,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+6% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-6% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 6%",
};
