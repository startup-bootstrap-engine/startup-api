import { IEquippableAccessoryTier27Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSilverDawnRing: IEquippableAccessoryTier27Blueprint = {
  key: AccessoriesBlueprint.SilverDawnRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/silver-dawn-ring.png",
  name: "Silver Dawn Ring",
  description: "Shimmering with the promise of new beginnings, heralding hope and endless possibilities.",
  attack: 81,
  defense: 76,
  tier: 27,
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 38000,
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
