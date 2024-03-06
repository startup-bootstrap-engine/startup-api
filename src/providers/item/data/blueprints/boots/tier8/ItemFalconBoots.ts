import { IEquippableLightArmorTier8Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { BootsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemFalconBoots: IEquippableLightArmorTier8Blueprint = {
  key: BootsBlueprint.FalconBoots,
  type: ItemType.Armor,
  subType: ItemSubType.Boot,
  textureAtlas: "items",
  texturePath: "boots/falcon-boots.png",
  name: "Falcon Boots",
  description: "Light as a feather, these boots promise swiftness in the skies and on land.",
  defense: 44,
  tier: 8,
  weight: 0.6,
  allowedEquipSlotType: [ItemSlotType.Feet],
  basePrice: 112,
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.Speed,
    buffPercentage: 10,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of speed and quickness flowing through your body. (+10% speed)",
        deactivation: "You feel the power of speed and quickness leaving your body. (-10% speed)",
      },
    },
  },
  equippedBuffDescription: "Increases speed by 10%",
};
