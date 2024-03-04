import { IEquippableAccessoryTier30Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSapphireSerenadeRing: IEquippableAccessoryTier30Blueprint = {
  key: AccessoriesBlueprint.SapphireSerenadeRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/sapphire-serenade-ring.png",
  name: "Sapphire Serenade Ring",
  description: "Whispering melodies of calm seas, serenity, and the vastness of celestial wonder.",
  attack: 88,
  defense: 83,
  tier: 30,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 41500,
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.Speed,
    buffPercentage: 14,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of speed and quickness flowing through your body. (+14% speed)",
        deactivation: "You feel the power of speed and quickness leaving your body. (-14% speed)",
      },
    },
  },
  equippedBuffDescription: "Increases speed by 14%",
};
