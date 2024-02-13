import { IEquippableAccessoryTier29Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemEmeraldRing: IEquippableAccessoryTier29Blueprint = {
  key: AccessoriesBlueprint.EmeraldRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/emerald-ring.png",
  name: "Emerald Ring",
  description: "Gleaming with lush green hues, embodying nature's vitality and captivating allure effortlessly.",
  attack: 86,
  defense: 81,
  tier: 29,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 40500,
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.MaxHealth,
    buffPercentage: 8,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of max health flowing through your body. (+8% MaxHealth)",
        deactivation: "You feel the power of max health leaving your body. (-8% MaxHealth)",
      },
    },
  },
  equippedBuffDescription: "Increases max health by 8% respectively",
};
