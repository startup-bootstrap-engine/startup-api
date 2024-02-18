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

export const itemCelestialChronicles: IEquippableBookTier1Blueprint = {
  key: BooksBlueprint.CelestialChronicles,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/celestial-chronicles.png",
  name: "Celestial Chronicles",
  description: "Records the movements of celestial bodies and their influence.",
  weight: 3.3,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 135,
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
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max mana flowing through your body. (+7%  max mana)",
          deactivation: "You feel the power of  max mana leaving your body. (-7%  max mana)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases max health by 7%, resistance by 7% and max mana by 7% respectively",
};
