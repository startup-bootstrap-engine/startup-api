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

export const itemMagicOrb: IEquippableBookTier6Blueprint = {
  key: BooksBlueprint.MagicOrb,
  type: ItemType.Accessory,
  subType: ItemSubType.Orb,
  textureAtlas: "items",
  texturePath: "books/magic-orb.png",
  name: "Magic Orb",
  description: "An orb emanating powerful magical energies.",
  weight: 3,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 215,
  canSell: true,
  tier: 6,
  equippedBuff: [
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
  equippedBuffDescription: "Increases max health by 10%, resistance by 10% and dexterity by 10% respectively",
};
