import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier18WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemArcaneSunderer: IEquippableMeleeTier18WeaponBlueprint = {
  key: AxesBlueprint.ArcaneSunderer,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/arcane-sunderer.png",
  name: "Arcane Sunderer",
  description: "A mystical axe wielding the power to unravel the fabric of reality.",
  weight: 4.7,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 131,
  defense: 127,
  tier: 18,
  rangeType: EntityAttackType.Melee,
  basePrice: 162,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 94,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 9,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+9% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-9% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 9%",
};
