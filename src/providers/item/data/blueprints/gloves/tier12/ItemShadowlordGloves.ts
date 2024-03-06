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

export const itemShadowlordGloves: IEquippableLightArmorTier12Blueprint = {
  key: GlovesBlueprint.ShadowlordGloves,
  type: ItemType.Armor,
  subType: ItemSubType.Glove,
  textureAtlas: "items",
  texturePath: "gloves/shadowlord-gloves.png",
  name: "Shadowlord Gloves",
  description: "Imbued with the obsidian essence of dark lords, they grant mastery over the shadows.",
  defense: 66,
  tier: 12,
  weight: 1.5,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 149,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.MagicResistance,
    buffPercentage: 10,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of magic resistance flowing through your body. (+10% magic resistance)",
        deactivation: "You feel the power of magic resistance leaving your body. (-10% magic resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases magic resistance by 10%",
};
