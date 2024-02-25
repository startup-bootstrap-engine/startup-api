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
import { IEquippableBookTier5Blueprint } from "../../../types/TierBlueprintTypes";

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
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Dexterity,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dexterity flowing through your body. (+9% dexterity)",
          deactivation: "You feel the power of dexterity leaving your body. (-9% dexterity)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases max health by 9%, resistance by 9% and dexterity by 6% respectively",
};
