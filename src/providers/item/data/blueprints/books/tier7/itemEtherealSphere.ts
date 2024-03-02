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

export const itemEtherealSphere: IEquippableBookTier7Blueprint = {
  key: BooksBlueprint.EtherealSphere,
  type: ItemType.Accessory,
  subType: ItemSubType.Orb,
  textureAtlas: "items",
  texturePath: "books/ethereal-sphere.png",
  name: "Ethereal Sphere",
  description: "A mystical sphere resonating with ethereal energies.",
  weight: 3.5,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 220,
  canSell: true,
  tier: 7,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
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
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 20,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases strength, resistance, max mana and max health by 20%.",
};
