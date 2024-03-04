import { IEquippableAccessoryTier30Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRubyTriquetraRing: IEquippableAccessoryTier30Blueprint = {
  key: AccessoriesBlueprint.RubyTriquetraRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/ruby-triquetra-ring.png",
  name: "Ruby Triquetra Ring",
  description: "Intertwining mystical symbols, radiating power, wisdom, and protection with fiery passion.",
  attack: 87,
  defense: 83,
  tier: 30,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 41000,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 13,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+13% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-13% resistance)",
      },
    },
  },

  equippedBuffDescription: "Increases resistance by 13%",
};
