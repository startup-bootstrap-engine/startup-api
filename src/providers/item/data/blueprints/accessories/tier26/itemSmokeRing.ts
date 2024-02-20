import { IEquippableAccessoryTier26Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSmokeRing: IEquippableAccessoryTier26Blueprint = {
  key: AccessoriesBlueprint.SmokeRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/smoke-ring.png",
  name: "Smoke Ring",
  description: "Enigmatic smoke ring swirling with mystery, casting shadows of ethereal magic in its wake.",
  attack: 77,
  defense: 74,
  tier: 26,
  weight: 1.1,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 38000,
  equippedBuff: {
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
  equippedBuffDescription: "Increases resistance by 11%",
};
