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
import { IEquippableBookTier5Blueprint } from "../../../types/TierBlueprintTypes";

export const itemSoulCrystal: IEquippableBookTier5Blueprint = {
  key: BooksBlueprint.SoulCrystal,
  type: ItemType.Accessory,
  subType: ItemSubType.Orb,
  textureAtlas: "items",
  texturePath: "books/soul-crystal.png",
  name: "Soul Crystal",
  description: "A crystal aimed at manipulating soul energy.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 205,
  canSell: true,
  tier: 5,
  equippedBuff: [
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
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of magic flowing through your body. (+9% magic)",
          deactivation: "You feel the power of magic leaving your body. (-9% magic)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+9% max health)",
          deactivation: "You feel the power of max health leaving your body. (-9% max health)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases max mana by 9%, magic by 9% and max health by 9% respectively",
};
