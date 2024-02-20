import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { BooksBlueprint } from "../../../types/itemsBlueprintTypes";
import { IEquippableBookTier1Blueprint } from "../../../types/TierBlueprintTypes";

export const itemAstralAtlas: IEquippableBookTier1Blueprint = {
  key: BooksBlueprint.AstralAtlas,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/astral-atlas.png",
  name: "Astral Atlas",
  description: "Maps the ethereal realms and astral planes.",
  weight: 3.6,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 150,
  canSell: false,
  tier: 1,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+7% strength)",
          deactivation: "You feel the power of strength leaving your body. (-7% strength)",
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
  equippedBuffDescription: "Increases strength by 7%, resistance by 7% and dexterity by 7% respectively",
};
