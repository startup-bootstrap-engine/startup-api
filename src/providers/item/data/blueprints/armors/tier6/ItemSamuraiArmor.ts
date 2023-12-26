import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { IEquippableArmorTier6Blueprint } from "../../../types/TierBlueprintTypes";
import { ArmorsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSamuraiArmor: IEquippableArmorTier6Blueprint = {
  key: ArmorsBlueprint.SamuraiArmor,
  type: ItemType.Armor,
  subType: ItemSubType.Armor,
  textureAtlas: "items",
  texturePath: "armors/samurai-armor.png",
  name: "Samurai Armor",
  description:
    "A legendary armor worn by the ancient samurai, providing excellent protection and enhancing the wearer's abilities.",
  defense: 46,
  tier: 6,
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.Torso],
  basePrice: 200,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the samurai flowing through your body. (+15% resistance)",
          deactivation: "You feel the power of the samurai leaving your body. (-15% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 15,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the samurai enhancing your vitality. (+15% MaxHealth)",
          deactivation: "You feel the power of the samurai leaving your body. (-15% MaxHealth)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance and max health by 15% respectively",
};
