import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier10WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemDragonFistHammer: IEquippableMeleeTier10WeaponBlueprint = {
  key: HammersBlueprint.DragonFistHammer,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "hammers/dragon-fist-hammer.png",
  name: "Dragon Fist Hammer",
  description:
    "Crafted from the scales of a dragon, this hammer combines the creature’s fiery breath and unmatched strength in its attacks.",
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 76,
  defense: 42,
  tier: 10,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 90,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 8,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+8% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-8% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 8%",
};
