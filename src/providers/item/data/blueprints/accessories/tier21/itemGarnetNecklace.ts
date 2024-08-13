import { IEquippableAccessoryTier21Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemGarnetNecklace: IEquippableAccessoryTier21Blueprint = {
  key: AccessoriesBlueprint.GarnetNecklace,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "accessories/garnet-necklace.png",
  name: "Garnet Necklace",
  description: "Exuding elegance and power, a prized possession for any noble adventurer.",
  attack: 66,
  defense: 66,
  tier: 21,
  weight: 0.6,
  allowedEquipSlotType: [ItemSlotType.Neck],
  basePrice: 34000,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+8% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-8% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.Speed,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of speed and quickness flowing through your body. (+12% speed)",
          deactivation: "You feel the power of speed and quickness leaving your body. (-12% speed)",
        },
      },
    },
  ],
  equippedBuffDescription: "Grants +8% resistance and +12% speed.",
};
