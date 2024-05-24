import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterAttributes,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemStormbreakerAxe: IEquippableMeleeTier14WeaponBlueprint = {
  key: AxesBlueprint.StormbreakerAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/stormbreaker-axe.png",
  name: "Stormbreaker Axe",
  description: "A mighty axe capable of harnessing the power of raging storms.",
  weight: 5.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 103,
  defense: 102,
  tier: 14,
  rangeType: EntityAttackType.Melee,
  basePrice: 135,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 88,
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.MaxHealth,
    buffPercentage: 4,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of max health flowing through your body. (+4% MaxHealth)",
        deactivation: "You feel the power of max health leaving your body. (-4% MaxHealth)",
      },
    },
  },
  equippedBuffDescription: "Increases max health by 4% respectively",
};
