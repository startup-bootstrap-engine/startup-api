import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier18WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCrownSplitterAxe: IEquippableMeleeTier18WeaponBlueprint = {
  key: AxesBlueprint.CrownSplitterAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/crown-splitter-axe.png",
  name: "Crown Splitter Axe",
  description: "Heavy, sharp axe. Strong for fighting. Looks tough.",
  weight: 6.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 130,
  defense: 126,
  tier: 18,
  rangeType: EntityAttackType.Melee,
  basePrice: 160,
  entityEffects: [EntityEffectBlueprint.Poison, EntityEffectBlueprint.Bleeding],
  entityEffectChance: 105,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 9,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of resistance flowing through your body. (+9% resistance)",
          deactivation: "You feel the power of resistance leaving your body. (-9% resistance)",
        },
      },
    },
    {
      type: CharacterBuffType.CharacterAttribute,
      trait: CharacterAttributes.MaxHealth,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of max health flowing through your body. (+7% MaxHealth)",
          deactivation: "You feel the power of max health leaving your body. (-7% MaxHealth)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 9% and max health by 7% respectively",
};
