import { IEquippableLightArmorTier12Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { LegsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSolarflareLegs: IEquippableLightArmorTier12Blueprint = {
  key: LegsBlueprint.SolarflareLegs,
  type: ItemType.Armor,
  subType: ItemSubType.Legs,
  textureAtlas: "items",
  texturePath: "legs/solarflare-legs.png",
  name: "Solarflare Legs",
  description: "Radiating the power of the sun, they offer warmth and light in the darkest of battles.",
  weight: 0.4,
  defense: 65,
  tier: 12,
  allowedEquipSlotType: [ItemSlotType.Legs],
  equippedBuff: [
    {
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
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+7% MaxHealth)",
          deactivation: "You feel the power of max health leaving your body. (-7% MaxHealth)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases speed by 14% and max health by 5% respectively",
};
