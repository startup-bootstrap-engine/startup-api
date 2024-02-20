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

export const itemEsotericEpistles: IEquippableBookTier3Blueprint = {
  key: BooksBlueprint.EsotericEpistles,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/esoteric-epistles.png",
  name: "Esoteric Epistles",
  description: "Contain cryptic messages from unknown sources, challenging to decipher.",
  weight: 5.1,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 170,
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
  equippedBuffDescription: "Increases strength by 9%, resistance by 8% and max mana by 8% respectively",
};
