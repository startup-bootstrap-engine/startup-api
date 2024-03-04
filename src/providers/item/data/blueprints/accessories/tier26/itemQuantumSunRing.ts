import { IEquippableAccessoryTier26Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AccessoriesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemQuantumSunRing: IEquippableAccessoryTier26Blueprint = {
  key: AccessoriesBlueprint.QuantumSunRing,
  type: ItemType.Accessory,
  subType: ItemSubType.Accessory,
  textureAtlas: "items",
  texturePath: "rings/quantum-sun-ring.png",
  name: "Quantum Sun Ring",
  description:
    "Gives pulsating with cosmic energy, radiating kaleidoscopic hues, embodying the universe's boundless power.",
  attack: 78,
  defense: 73,
  tier: 26,
  weight: 1.1,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 38500,
  equippedBuff: {
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
  equippedBuffDescription: "Increases speed by 13%",
};
