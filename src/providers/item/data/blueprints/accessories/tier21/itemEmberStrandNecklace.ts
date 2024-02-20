import { IEquippableAccessoryTier21Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemEmberStrandNecklace: IEquippableAccessoryTier21Blueprint = {
  key: AccessoriesBlueprint.EmberStrandNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/ember-strand-necklace.png",
  name: "Ember Strand Necklace",
  description: "Gleaming with fiery hues, embodying warmth, resilience, and the flickering spirit of adventure.",
  attack: 64,
  defense: 64,
  tier: 21,
  weight: 0.6,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 33500,
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
