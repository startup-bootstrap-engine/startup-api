import { IEquippableLightArmorTier12Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { BootsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemGaiasSoleplate: IEquippableLightArmorTier12Blueprint = {
  key: BootsBlueprint.GaiasSoleplate,
  type: ItemType.Armor,
  subType: ItemSubType.Boot,
  textureAtlas: "items",
  texturePath: "boots/gaias-soleplate.png",
  name: "Gaias Soleplate",
  description: "Embodying the earths strength, they ground the wearer with natures power.",
  defense: 68,
  tier: 12,
  weight: 0.5,
  allowedEquipSlotType: [ItemSlotType.Feet],
  basePrice: 135,
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.Speed,
    buffPercentage: 18,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of speed and quickness flowing through your body. (+18% speed)",
        deactivation: "You feel the power of speed and quickness leaving your body. (-18% speed)",
      },
    },
  },
  equippedBuffDescription: "Increases speed by 18%",
};
