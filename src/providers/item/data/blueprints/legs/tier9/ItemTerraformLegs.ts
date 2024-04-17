import { IEquippableLightArmorTier9Blueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { LegsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemTerraformLegs: IEquippableLightArmorTier9Blueprint = {
  key: LegsBlueprint.TerraformLegs,
  type: ItemType.Armor,
  subType: ItemSubType.Legs,
  textureAtlas: "items",
  texturePath: "legs/terraform-legs.png",
  name: "Terraform Legs",
  description: "Infused with the spirit of the earth, these pants provide unmatched stability.",
  weight: 0.6,
  defense: 50,
  tier: 9,
  allowedEquipSlotType: [ItemSlotType.Legs],
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.Speed,
    buffPercentage: 4,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of speed and quickness flowing through your body. (+4% speed)",
        deactivation: "You feel the power of speed and quickness leaving your body. (-4% speed)",
      },
    },
  },
  equippedBuffDescription: "Increases speed by 4%",
};
