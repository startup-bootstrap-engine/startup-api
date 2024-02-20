import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableLightArmorTier5Blueprint } from "../../../types/TierBlueprintTypes";
import { HelmetsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemAmethystArchmageHat: IEquippableLightArmorTier5Blueprint = {
  key: HelmetsBlueprint.AmethystArchmageHat,
  type: ItemType.Armor,
  subType: ItemSubType.Helmet,
  textureAtlas: "items",
  texturePath: "helmets/amethyst-archmage-hat.png",
  name: "Amethyst Archmage Hat",
  description: "A hat adorned with sparkling amethysts, representing the wisdom and power of archmages",
  defense: 20,
  tier: 5,
  weight: 2.8,
  allowedEquipSlotType: [ItemSlotType.Head],
  basePrice: 90,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Strength,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of strength flowing through your body. (+10% strength)",
          deactivation: "You feel the power of strength leaving your body. (-10% strength)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 8,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+8% MaxHealth)",
          deactivation: "You feel the power of max health leaving your body. (-8% MaxHealth)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 10% and max health by 8% respectively",
};
