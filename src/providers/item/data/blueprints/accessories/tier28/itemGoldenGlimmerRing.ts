import { IEquippableAccessoryTier28Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemGoldenGlimmerRing: IEquippableAccessoryTier28Blueprint = {
  key: AccessoriesBlueprint.GoldenGlimmerRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/golden-glimmer-ring.png",
  name: "Golden Glimmer Ring",
  description: "Shining with celestial radiance, evoking the warmth of divine blessings and prosperity",
  attack: 83,
  defense: 76,
  tier: 28,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 38000,
  equippedBuff: [
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
      trait: CharacterAttributes.Speed,
      buffPercentage: 13,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of speed and quickness flowing through your body. (+13% speed)",
          deactivation: "You feel the power of speed and quickness leaving your body. (-13% speed)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 11% and speed by 13% respectively",
};
