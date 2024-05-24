import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemShadowHammer: IEquippableMeleeTier14WeaponBlueprint = {
  key: HammersBlueprint.ShadowHammer,
  type: ItemType.Weapon,
  subType: ItemSubType.Mace,
  textureAtlas: "items",
  texturePath: "hammers/shadow-hammer.png",
  name: "Shadow Hammer",
  description: "A hammer infused with dark energy, capable of draining the life force of its victims.",
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 102,
  defense: 60,
  tier: 14,
  rangeType: EntityAttackType.Melee,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 85,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 11,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+11% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-11% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 11%",
};
