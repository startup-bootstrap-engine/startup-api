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

export const itemVoidhammer: IEquippableMeleeTier13WeaponBlueprint = {
  key: HammersBlueprint.Voidhammer,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "hammers/void-hammer.png",
  name: "Voidhammer",
  description: "A mysterious hammer that draws power from the void, its strikes leaving enemies drained of life.",
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 96,
  defense: 51,
  tier: 13,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Bleeding],
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
