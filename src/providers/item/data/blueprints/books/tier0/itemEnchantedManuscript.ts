import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { BooksBlueprint } from "../../../types/itemsBlueprintTypes";
import { IEquippableBookTier0Blueprint } from "../../../types/TierBlueprintTypes";

export const itemEnchantedManuscript: IEquippableBookTier0Blueprint = {
  key: BooksBlueprint.EnchantedManuscript,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/enchanted-manuscript.png",
  name: "Enchanted Manuscript",
  description: "Radiates with mystical energy, pulsing softly.",
  weight: 2.1,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 100,
  canSell: false,
  tier: 0,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max mana flowing through your body. (+6%  max mana)",
          deactivation: "You feel the power of  max mana leaving your body. (-6%  max mana)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of magic flowing through your body. (+6% magic)",
          deactivation: "You feel the power of magic leaving your body. (-6% magic)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of magic resistance flowing through your body. (+6% magic resistance)",
          deactivation: "You feel the power of magic resistance leaving your body. (-6% magic resistance)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases max mana by 6%, magic by 6% and magic resistance by 6% respectively",
};
