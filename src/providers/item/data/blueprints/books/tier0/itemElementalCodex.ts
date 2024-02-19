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

export const itemElementalCodex: IEquippableBookTier0Blueprint = {
  key: BooksBlueprint.ElementalCodex,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/elemental-codex.png",
  name: "Elemental Codex",
  description: "Chronicles the elements' mystical properties.",
  weight: 2.7,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 120,
  canSell: false,
  tier: 0,
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
      trait: BasicAttribute.MagicResistance,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of magic resistance flowing through your body. (+7% magic resistance)",
          deactivation: "You feel the power of magic resistance leaving your body. (-7% magic resistance)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases max health by 7% and magic resistance by 7% respectively",
};
