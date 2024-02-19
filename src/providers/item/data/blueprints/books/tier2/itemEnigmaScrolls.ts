import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { BooksBlueprint } from "../../../types/itemsBlueprintTypes";
import { IEquippableBookTier2Blueprint } from "../../../types/TierBlueprintTypes";

export const itemEnigmaScrolls: IEquippableBookTier2Blueprint = {
  key: BooksBlueprint.EnigmaScrolls,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/enigma-scrolls.png",
  name: "Enigma Scrolls",
  description: "Shrouded in mystery, their contents decipherable by few.",
  weight: 3.9,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 155,
  canSell: false,
  tier: 2,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+8% strength)",
          deactivation: "You feel the power of strength leaving your body. (-8% strength)",
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
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Dexterity,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dexterity flowing through your body. (+7% dexterity)",
          deactivation: "You feel the power of dexterity leaving your body. (-7% dexterity)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 8%, resistance by 7% and dexterity by 7% respectively",
};
