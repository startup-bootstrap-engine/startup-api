import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier17WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemSeraphicAxe: IEquippableMeleeTier17WeaponBlueprint = {
  key: AxesBlueprint.SeraphicAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/seraphic-axe.png",
  name: "Seraphic Axe",
  description: "An ethereal axe blessed by celestial beings, striking with divine precision.",
  weight: 5.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 126,
  defense: 124,
  tier: 17,
  rangeType: EntityAttackType.Melee,
  basePrice: 145,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 94,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 7,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+7% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-7% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 7%",
};
