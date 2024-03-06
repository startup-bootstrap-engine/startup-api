import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableLightArmorTier10Blueprint } from "../../../types/TierBlueprintTypes";
import { GlovesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRoyalDecreeGloves: IEquippableLightArmorTier10Blueprint = {
  key: GlovesBlueprint.RoyalDecreeGloves,
  type: ItemType.Armor,
  subType: ItemSubType.Glove,
  textureAtlas: "items",
  texturePath: "gloves/royal-decree-gloves.png",
  name: "Royal Decree Gloves",
  description: "Crafted for monarchs, these gloves exude opulence and command respect.",
  defense: 54,
  tier: 10,
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 129,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 8,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+8% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-8% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 8%",
};
