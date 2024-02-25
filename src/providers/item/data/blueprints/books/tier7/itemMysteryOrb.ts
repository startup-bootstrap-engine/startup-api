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
import { IEquippableBookTier7Blueprint } from "../../../types/TierBlueprintTypes";

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
      trait: BasicAttribute.Strength,
      buffPercentage: 11,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+11% strength)",
          deactivation: "You feel the power of strength leaving your body. (-11% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 11,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+11% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-11% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Dexterity,
      buffPercentage: 11,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of dexterity flowing through your body. (+11% dexterity)",
          deactivation: "You feel the power of dexterity leaving your body. (-11% dexterity)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 11%, resistance by 11% and dexterity by 11% respectively",
};
