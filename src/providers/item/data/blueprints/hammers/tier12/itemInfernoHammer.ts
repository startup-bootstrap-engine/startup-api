import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier12WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemInfernoHammer: IEquippableMeleeTier12WeaponBlueprint = {
  key: HammersBlueprint.InfernoHammer,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "hammers/inferno-hammer.png",
  name: "Inferno Hammer",
  description: "A hammer forged in the depths of the inferno, its fiery strikes leave enemies scorched and smoldering.",
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 88,
  defense: 42,
  tier: 12,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Burning],
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
