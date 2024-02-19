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

export const itemSpellboundCodex: IEquippableBookTier0Blueprint = {
  key: BooksBlueprint.SpellboundCodex,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/spellbound-codex.png",
  name: "Spellbound Codex",
  description: "Imbued with enchantments to safeguard its contents.",
  weight: 1.8,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 95,
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
      trait: BasicAttribute.Strength,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+5% strength)",
          deactivation: "You feel the power of strength leaving your body. (-5% strength)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases max mana by 6%, magic by 6% and strength by 5% respectively",
};
