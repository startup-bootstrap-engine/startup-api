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
import { IEquippableBookTier3Blueprint } from "../../../types/TierBlueprintTypes";

export const itemMysticalTomes: IEquippableBookTier3Blueprint = {
  key: BooksBlueprint.MysticalTomes,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/mystical-tomes.png",
  name: "Mystical Tomes",
  description: "Foretell the paths of fate and destiny.",
  weight: 5.7,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 180,
  canSell: false,
  tier: 3,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+9% strength)",
          deactivation: "You feel the power of strength leaving your body. (-9% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+9% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-9% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max mana flowing through your body. (+9%  max mana)",
          deactivation: "You feel the power of  max mana leaving your body. (-9%  max mana)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 9%, resistance by 9% and max mana by 9% respectively",
};
