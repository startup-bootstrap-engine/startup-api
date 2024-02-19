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
import { IEquippableBookTier4Blueprint } from "../../../types/TierBlueprintTypes";

export const itemAlchemistsAlmanac: IEquippableBookTier4Blueprint = {
  key: BooksBlueprint.AlchemistsAlmanac,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/alchemists-almanac.png",
  name: "Alchemists Almanac",
  description: "Details the secrets of transmutation and transformation.",
  weight: 6.3,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 200,
  canSell: false,
  tier: 4,
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
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Dexterity,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dexterity flowing through your body. (+10% dexterity)",
          deactivation: "You feel the power of dexterity leaving your body. (-10% dexterity)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 10%, max health by 10%, and dexterity by 10% respectively",
};
