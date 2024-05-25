import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier15WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemFrostSteelHammer: IEquippableMeleeTier15WeaponBlueprint = {
  key: HammersBlueprint.FrostSteelHammer,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "hammers/froststeel-hammer.png",
  name: "Froststeel Hammer",
  description: "A hammer forged from enchanted froststeel, capable of freezing enemies upon impact.",
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 110,
  defense: 60,
  tier: 15,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Freezing],
  entityEffectChance: 85,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 12,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+12% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-12% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 12%",
};
