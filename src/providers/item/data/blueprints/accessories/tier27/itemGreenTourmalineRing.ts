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

export const itemGreenTourmalineRing: IEquippableAccessoryTier27Blueprint = {
  key: AccessoriesBlueprint.GreenTourmalineRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/green-tourmaline-ring.png",
  name: "Green Tourmaline Ring",
  description: "Sparkling with nature's vitality, imbued with healing energy and serene tranquility.",
  attack: 80,
  defense: 73,
  tier: 27,
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 39000,
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.MaxHealth,
    buffPercentage: 10,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of max health flowing through your body. (+10% MaxHealth)",
        deactivation: "You feel the power of max health leaving your body. (-10% MaxHealth)",
      },
    },
  },
  equippedBuffDescription: "Increases max health by 10% respectively",
};
