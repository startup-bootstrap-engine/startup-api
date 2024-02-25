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
import { IEquippableBookTier6Blueprint } from "../../../types/TierBlueprintTypes";

export const itemAstralGlobe: IEquippableBookTier6Blueprint = {
  key: BooksBlueprint.AstralGlobe,
  type: ItemType.Accessory,
  subType: ItemSubType.Orb,
  textureAtlas: "items",
  texturePath: "books/astral-globe.png",
  name: "Astral Globe",
  description: "A globe infused with the essence of the astral plane.",
  weight: 3,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 210,
  canSell: true,
  tier: 6,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+10% strength)",
          deactivation: "You feel the power of strength leaving your body. (-10% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+10% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-10% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+10% max health)",
          deactivation: "You feel the power of max health leaving your body. (-10% max health)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 10%, resistance by 10% and dexterity by 10% respectively",
};
