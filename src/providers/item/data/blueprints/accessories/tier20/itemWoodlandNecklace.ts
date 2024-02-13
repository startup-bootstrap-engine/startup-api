import { IEquippableAccessoryTier20Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemWoodlandNecklace: IEquippableAccessoryTier20Blueprint = {
  key: AccessoriesBlueprint.WoodlandNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/woodland-necklace.png",
  name: "Woodland Necklace",
  description: "Crafted from nature's bounty, a symbol of harmony, connection, and the whispering secrets of forests.",
  attack: 61,
  defense: 61,
  tier: 20,
  weight: 0.5,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 32000,
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
