import { IEquippableAccessoryTier25Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemWoodenRing: IEquippableAccessoryTier25Blueprint = {
  key: AccessoriesBlueprint.WoodenRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/wooden-ring.png",
  name: "Wooden Ring",
  description: "Simple wooden ring adorned with intricate carvings, emanating an ancient, rustic charm.",
  attack: 74,
  defense: 72,
  tier: 25,
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 37000,
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
