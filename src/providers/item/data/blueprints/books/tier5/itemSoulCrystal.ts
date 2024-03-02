import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableBookTier5Blueprint } from "../../../types/TierBlueprintTypes";
import { BooksBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSoulCrystal: IEquippableBookTier5Blueprint = {
  key: BooksBlueprint.SoulCrystal,
  type: ItemType.Accessory,
  subType: ItemSubType.Orb,
  textureAtlas: "items",
  texturePath: "books/soul-crystal.png",
  name: "Soul Crystal",
  description: "A crystal aimed at manipulating soul energy.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 205,
  canSell: true,
  tier: 5,
  equippedBuff: [
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases max mana by 15% and magic by 20%.",
};
