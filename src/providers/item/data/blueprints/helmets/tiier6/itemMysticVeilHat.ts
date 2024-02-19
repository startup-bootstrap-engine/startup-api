import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableLightArmorTier6Blueprint } from "../../../types/TierBlueprintTypes";
import { HelmetsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemMysticVeilHat: IEquippableLightArmorTier6Blueprint = {
  key: HelmetsBlueprint.MysticVeilHat,
  type: ItemType.Armor,
  subType: ItemSubType.Helmet,
  textureAtlas: "items",
  texturePath: "helmets/mystic-veil-hat .png",
  name: "Mystic Veil Hat",
  description: "Conceals the wearer's identity while amplifying their magical abilities.",
  defense: 28,
  tier: 6,
  weight: 3.4,
  allowedEquipSlotType: [ItemSlotType.Head],
  basePrice: 100,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+12% strength)",
          deactivation: "You feel the power of strength leaving your body. (-12% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+8% MaxHealth)",
          deactivation: "You feel the power of max health leaving your body. (-8% MaxHealth)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 12% and max health by 10% respectively",
};
