import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableBookTier5Blueprint } from "../../../types/TierBlueprintTypes";
import { BooksBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemElementalSphere: IEquippableBookTier5Blueprint = {
  key: BooksBlueprint.ElementalSphere,
  type: ItemType.Accessory,
  subType: ItemSubType.Orb,
  textureAtlas: "items",
  texturePath: "books/elemental-sphere.png",
  name: "Elemental Sphere",
  description: "A sphere containing the essence of elemental powers.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 200,
  canSell: true,
  tier: 5,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Magic,
      buffPercentage: 30,
      durationType: CharacterBuffDurationType.Permanent,
    },
  ],
  equippedBuffDescription: "Increases magic by 30%.",
};
