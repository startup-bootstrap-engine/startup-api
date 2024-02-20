import { IEquippableAccessoryTier19Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemGoldenRubyNecklace: IEquippableAccessoryTier19Blueprint = {
  key: AccessoriesBlueprint.GoldenRubyNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/golden-ruby-necklace.png",
  name: "Golden Ruby Necklace",
  description: "Radiant allure, embodying wealth, courage, and the fiery heart of a valiant adventurer.",
  attack: 58,
  defense: 58,
  tier: 19,
  weight: 0.4,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 31500,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+8% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-8% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+6% MaxHealth)",
          deactivation: "You feel the power of max health leaving your body. (-6% MaxHealth)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 8% and max health by 6% respectively",
};
