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

export const itemTwilightEmberNecklace: IEquippableAccessoryTier23Blueprint = {
  key: AccessoriesBlueprint.TwilightEmberNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/twilight-ember-necklace.png",
  name: "Twilight Ember Necklace",
  description: "Capturing the fading sunlight, evoking mystery, resilience, and the allure of dusk.",
  attack: 70,
  defense: 69,
  tier: 23,
  weight: 0.8,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 35000,
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
  equippedBuffDescription: "Increases max health by 10%",
};
