import { IEquippableAccessoryTier23Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemAzureNecklace: IEquippableAccessoryTier23Blueprint = {
  key: AccessoriesBlueprint.AzureNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/azure-necklace.png",
  name: "Azure Necklace",
  description: "Reflecting the vast sky, embodying calm, clarity, and the boundless freedom of the heavens.",
  attack: 72,
  defense: 70,
  tier: 23,
  weight: 0.8,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 35500,
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.MaxHealth,
    buffPercentage: 9,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of max health flowing through your body. (+9% MaxHealth)",
        deactivation: "You feel the power of max health leaving your body. (-9% MaxHealth)",
      },
    },
  },
  equippedBuffDescription: "Increases max health by 9% respectively",
};
