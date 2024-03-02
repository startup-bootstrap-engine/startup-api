import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableBookTier6Blueprint } from "../../../types/TierBlueprintTypes";
import { BooksBlueprint } from "../../../types/itemsBlueprintTypes";

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
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Dexterity,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases max health by 10%, resistance by 10% and dexterity by 10% respectively",
};
