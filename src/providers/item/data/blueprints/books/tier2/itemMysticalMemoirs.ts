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

export const itemMysticalMemoirs: IEquippableBookTier2Blueprint = {
  key: BooksBlueprint.MysticalMemoirs,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/mystical-memoirs.png",
  name: "Mystical Memoirs",
  description: "Chronicles the journeys and discoveries of legendary wizards.",
  weight: 4.2,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 160,
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
  equippedBuffDescription: "Increases strength by 8%, resistance by 8% and dexterity by 7% respectively",
};
