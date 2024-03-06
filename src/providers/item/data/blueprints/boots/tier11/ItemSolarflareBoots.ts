import { IEquippableLightArmorTier11Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { BootsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSolarflareBoots: IEquippableLightArmorTier11Blueprint = {
  key: BootsBlueprint.SolarflareBoots,
  type: ItemType.Armor,
  subType: ItemSubType.Boot,
  textureAtlas: "items",
  texturePath: "boots/solarflare-boots.png",
  name: "Solarflare Boots",
  description: "Illuminated by the sun, they blaze a trail of radiant energy.",
  defense: 60,
  tier: 11,
  weight: 0.4,
  allowedEquipSlotType: [ItemSlotType.Feet],
  basePrice: 128,
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.Speed,
    buffPercentage: 16,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of speed and quickness flowing through your body. (+16% speed)",
        deactivation: "You feel the power of speed and quickness leaving your body. (-16% speed)",
      },
    },
  },
  equippedBuffDescription: "Increases speed by 16%",
};
