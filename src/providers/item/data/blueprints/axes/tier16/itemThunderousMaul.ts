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

export const itemThunderousMaul: IEquippableMeleeTier16WeaponBlueprint = {
  key: AxesBlueprint.ThunderousMaul,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/thunderous-maul.png",
  name: "Thunderous Maul",
  description: "A massive maul that crackles with the power of thunder, devastating foes with each strike.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 119,
  defense: 118,
  tier: 16,
  rangeType: EntityAttackType.Melee,
  basePrice: 141,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 94,
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
