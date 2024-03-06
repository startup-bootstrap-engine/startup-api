import { IEquippableLightArmorTier10Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { BootsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemVoltstepBoots: IEquippableLightArmorTier10Blueprint = {
  key: BootsBlueprint.VoltstepBoots,
  type: ItemType.Armor,
  subType: ItemSubType.Boot,
  textureAtlas: "items",
  texturePath: "boots/voltstep-boots.png",
  name: "Voltstep Boots",
  description: "Charged with electric might, every step buzzes with energy.",
  defense: 55,
  tier: 10,
  weight: 0.5,
  allowedEquipSlotType: [ItemSlotType.Feet],
  basePrice: 124,
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
