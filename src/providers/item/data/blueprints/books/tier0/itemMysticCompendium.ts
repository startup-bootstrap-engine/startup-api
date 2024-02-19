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

export const itemMysticCompendium: IEquippableBookTier0Blueprint = {
  key: BooksBlueprint.MysticCompendium,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/mystic-compendium.png",
  name: "Mystic Compendium",
  description: "Holds knowledge from realms beyond.",
  weight: 2.4,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 110,
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
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+6% max health)",
          deactivation: "You feel the power of max health leaving your body. (-6% max health)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases max mana by 6%, magic by 6% and max health by 6% respectively",
};
