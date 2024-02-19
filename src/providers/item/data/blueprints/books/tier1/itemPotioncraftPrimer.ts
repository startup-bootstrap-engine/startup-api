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
import { IEquippableBookTier1Blueprint } from "../../../types/TierBlueprintTypes";

export const itemPotioncraftPrimer: IEquippableBookTier1Blueprint = {
  key: BooksBlueprint.PotioncraftPrimer,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/potioncraft-primer.png",
  name: "Potioncraft Primer",
  description: "Guides the creation of potent elixirs.",
  weight: 3,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 130,
  canSell: false,
  tier: 1,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+7% max health)",
          deactivation: "You feel the power of max health leaving your body. (-7% max health)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+7% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-7% resistance)",
        },
      },
    },
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
  ],
  equippedBuffDescription: "Increases max health by 7%, resistance by 7% and max mana by 6% respectively",
};
