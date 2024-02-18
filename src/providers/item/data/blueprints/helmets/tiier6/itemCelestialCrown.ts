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

export const itemCelestialCrown: IEquippableLightArmorTier6Blueprint = {
  key: HelmetsBlueprint.CelestialCrown,
  type: ItemType.Armor,
  subType: ItemSubType.Helmet,
  textureAtlas: "items",
  texturePath: "helmets/celestial-crown.png",
  name: "Celestial Crown",
  description: "Adorned with symbols of the heavens, granting celestial blessings.",
  defense: 30,
  tier: 6,
  weight: 3.6,
  allowedEquipSlotType: [ItemSlotType.Head],
  basePrice: 110,
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
      buffPercentage: 12,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+12% MaxHealth)",
          deactivation: "You feel the power of max health leaving your body. (-12% MaxHealth)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases strength by 12% and max health by 12% respectively",
};
