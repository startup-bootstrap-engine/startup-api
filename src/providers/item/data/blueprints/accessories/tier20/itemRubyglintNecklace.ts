import { IEquippableAccessoryTier20Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRubyglintNecklace: IEquippableAccessoryTier20Blueprint = {
  key: AccessoriesBlueprint.RubyglintNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/rubyglint-necklace.png",
  name: "Rubyglint Necklace",
  description: "Sparkling allure, capturing the essence of passion, ambition, and dazzling elegance in every facet.",
  attack: 63,
  defense: 63,
  tier: 20,
  weight: 0.5,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 33000,
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.Speed,
    buffPercentage: 14,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of speed and quickness flowing through your body. (+14% speed)",
        deactivation: "You feel the power of speed and quickness leaving your body. (-14% speed)",
      },
    },
  },
  equippedBuffDescription: "Increases speed by 14%",
};
