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
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 11,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+11% max health)",
          deactivation: "You feel the power of max health leaving your body. (-11% max health)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 11%, resistance by 11% and max health by 11% respectively",
};
