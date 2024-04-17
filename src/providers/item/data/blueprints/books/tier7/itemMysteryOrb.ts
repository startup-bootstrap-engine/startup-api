import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableBookTier7Blueprint } from "../../../types/TierBlueprintTypes";
import { BooksBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemMysteryOrb: IEquippableBookTier7Blueprint = {
  key: BooksBlueprint.MysteryOrb,
  type: ItemType.Accessory,
  subType: ItemSubType.Orb,
  textureAtlas: "items",
  texturePath: "books/mystery-orb.png",
  name: "Mystery Orb",
  description: "An orb shrouded in mystery, its powers unknown.",
  weight: 4,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 225,
  canSell: true,
  tier: 7,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxMana,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Dexterity,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases magic and max mana by 20%, resistance and dexterity 15% respectively.",
};
