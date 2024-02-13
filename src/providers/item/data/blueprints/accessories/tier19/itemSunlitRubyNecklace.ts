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

export const itemSunlitRubyNecklace: IEquippableAccessoryTier19Blueprint = {
  key: AccessoriesBlueprint.SunlitRubyNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/sunlit-ruby-necklace.png",
  name: "Sunlit Ruby Necklace",
  description: "Bathed in golden rays, evoking warmth, vitality, and the fiery energy of dawn.",
  attack: 60,
  defense: 60,
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
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 4,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max mana flowing through your body. (+4% MaxMana)",
          deactivation: "You feel the power of max mana leaving your body. (-4% MaxMana)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 8% and max mana by 4% respectively",
};
