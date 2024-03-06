import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableLightArmorTier12Blueprint } from "../../../types/TierBlueprintTypes";
import { GlovesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemOsirisGloves: IEquippableLightArmorTier12Blueprint = {
  key: GlovesBlueprint.OsirisGloves,
  type: ItemType.Armor,
  subType: ItemSubType.Glove,
  textureAtlas: "items",
  texturePath: "gloves/osiris-gloves.png",
  name: "Osiris Gloves",
  description: "Holding ancient Egyptian might, they are the key to life, death, and rebirth.",
  defense: 69,
  tier: 12,
  weight: 1.2,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 154,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.MagicResistance,
    buffPercentage: 8,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of magic resistance flowing through your body. (+8% magic resistance)",
        deactivation: "You feel the power of magic resistance leaving your body. (-8% magic resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases magic resistance by 8%",
};
