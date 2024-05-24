import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { HammersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemAvalancheHammer: IEquippableMeleeTier13WeaponBlueprint = {
  key: HammersBlueprint.AvalancheHammer,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "hammers/avalanche-hammer.png",
  name: "Avalanche Hammer",
  description: "A massive hammer that brings forth the fury of an avalanche upon striking.",
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 95,
  defense: 50,
  tier: 13,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Freezing],
  entityEffectChance: 85,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 10,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+10% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-10% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 10%",
};
