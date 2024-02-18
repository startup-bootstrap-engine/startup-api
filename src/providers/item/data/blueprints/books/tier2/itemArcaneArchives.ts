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

export const itemArcaneArchives: IEquippableBookTier2Blueprint = {
  key: BooksBlueprint.ArcaneArchives,
  type: ItemType.Accessory,
  subType: ItemSubType.Book,
  textureAtlas: "items",
  texturePath: "books/arcane-archives.png",
  name: "Arcane Archives",
  description: "Houses a wealth of knowledge on all things arcane.",
  weight: 4.5,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 165,
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
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+8% max health)",
          deactivation: "You feel the power of max health leaving your body. (-8% max health)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 8%, resistance by 8% and dexterity by 8% respectively",
};
