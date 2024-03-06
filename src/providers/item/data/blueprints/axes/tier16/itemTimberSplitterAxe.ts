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

export const itemTimberSplitterAxe: IEquippableMeleeTier16WeaponBlueprint = {
  key: AxesBlueprint.TimberSplitterAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/timber-splitter-axe.png",
  name: "Timber Splitter Axe",
  description: "Powerful, wedge-shaped head for efficient log splitting and durable performance.",
  weight: 5.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 115,
  defense: 112,
  tier: 16,
  rangeType: EntityAttackType.Melee,
  basePrice: 140,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 100,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Strength,
    buffPercentage: 6,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the strength and fortitude coursing through your body. (+6% strength)",
        deactivation: "You feel the strength and fortitude coursing leaving through your body. (-6% strength)",
      },
    },
  },
  equippedBuffDescription: "Increases strength by 6%",
};
