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
import { IEquippableBookTier2Blueprint } from "../../../types/TierBlueprintTypes";

export const itemElementalGrimoire: IEquippableBookTier2Blueprint = {
  key: BooksBlueprint.ElementalGrimoire,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/elemental-grimoire.png",
  name: "Elemental Grimoire",
  description: "Focuses on the manipulation of elemental forces.",
  weight: 4.8,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 170,
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
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max mana flowing through your body. (+8%  max mana)",
          deactivation: "You feel the power of  max mana leaving your body. (-8%  max mana)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 8%, resistance by 8% and max mana by 8% respectively",
};
