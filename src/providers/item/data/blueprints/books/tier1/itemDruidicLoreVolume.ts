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

export const itemDruidicLoreVolume: IEquippableBookTier1Blueprint = {
  key: BooksBlueprint.DruidicLoreVolume,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/druidic-lore-volume.png",
  name: "Druidic Lore Volume",
  description: "Revered among nature magic practitioners.",
  weight: 3.3,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 140,
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
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Dexterity,
      buffPercentage: 6,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dexterity flowing through your body. (+6% dexterity)",
          deactivation: "You feel the power of dexterity leaving your body. (-6% dexterity)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases max health by 7%, resistance by 7% and dexterity by 6% respectively",
};
