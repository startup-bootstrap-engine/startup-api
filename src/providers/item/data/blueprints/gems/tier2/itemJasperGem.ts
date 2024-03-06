import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableArmorTier2Blueprint } from "../../../types/TierBlueprintTypes";
import { GemsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemJasperGem: IEquippableArmorTier2Blueprint = {
  key: GemsBlueprint.JasperGem,
  type: ItemType.Jewelry,
  subType: ItemSubType.Gem,
  textureAtlas: "items",
  texturePath: "gems/jasper-gem.png",
  name: "Jasper Gem",
  description: "Rustic allure, nature's palette, a mystical touch; embody the essence of adventure.",
  defense: 15,
  tier: 2,
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.Accessory],
  basePrice: 65,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Strength,
    buffPercentage: 10,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the strength and fortitude coursing through your body. (+10% strength)",
        deactivation: "You feel the strength and fortitude coursing leaving through your body. (-10% strength)",
      },
    },
  },
  equippedBuffDescription: "Increases strength by 10%",
};
