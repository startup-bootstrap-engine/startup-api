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

export const itemStormforgeReaver: IEquippableMeleeTier18WeaponBlueprint = {
  key: AxesBlueprint.StormforgeReaver,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/stormforge-reaver.png",
  name: "Stormforge Reaver",
  description: "A formidable axe forged in the heart of a raging storm, striking with the fury of thunder.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 130,
  defense: 129,
  tier: 18,
  rangeType: EntityAttackType.Melee,
  basePrice: 159,
  entityEffects: [EntityEffectBlueprint.Bleeding],
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
