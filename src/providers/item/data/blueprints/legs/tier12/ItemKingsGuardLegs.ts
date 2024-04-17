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

export const itemKingsGuardLegs: IEquippableLightArmorTier12Blueprint = {
  key: LegsBlueprint.KingsGuardLegs,
  type: ItemType.Armor,
  subType: ItemSubType.Legs,
  textureAtlas: "items",
  texturePath: "legs/kings-guard-legs.png",
  name: "Kings Guard Legs",
  description: "Worn by the elite protectors of the realm, signaling authority and might.",
  weight: 0.6,
  defense: 68,
  tier: 12,
  allowedEquipSlotType: [ItemSlotType.Legs],
  equippedBuff: [
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
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 5,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+5% MaxHealth)",
          deactivation: "You feel the power of max health leaving your body. (-5% MaxHealth)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases speed by 12% and max health by 5% respectively",
};
