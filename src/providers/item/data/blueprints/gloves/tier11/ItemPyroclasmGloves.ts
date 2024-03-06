import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableLightArmorTier11Blueprint } from "../../../types/TierBlueprintTypes";
import { GlovesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemPyroclasmGloves: IEquippableLightArmorTier11Blueprint = {
  key: GlovesBlueprint.PyroclasmGloves,
  type: ItemType.Armor,
  subType: ItemSubType.Glove,
  textureAtlas: "items",
  texturePath: "gloves/pyroclasm-gloves.png",
  name: "Pyroclasm Gloves",
  description: "Drawing from volcanic might, these gloves can unleash torrents of molten rage.",
  defense: 62,
  tier: 11,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.Ring],
  basePrice: 142,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 10,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+10% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-10% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 10%",
};
