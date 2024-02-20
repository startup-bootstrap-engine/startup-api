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

export const itemLoreVolume: IEquippableBookTier3Blueprint = {
  key: BooksBlueprint.LoreVolume,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/lore-volume.png",
  name: "Lore Volume",
  description: "Revered among nature magic practitioners.",
  weight: 6,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 190,
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
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+9% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-9% resistance)",
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
  equippedBuffDescription: "Increases strength by 9%, resistance by 9% and max health by 9% respectively",
};
