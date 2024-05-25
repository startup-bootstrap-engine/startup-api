import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
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

export const itemFrostbiteCleaver: IEquippableMeleeTier13WeaponBlueprint = {
  key: AxesBlueprint.FrostbiteCleaver,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/frostbite-cleaver.png",
  name: "Frostbite Cleaver",
  description: "An axe imbued with the icy chill of winter, freezing foes on impact.",
  weight: 3.9,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 97,
  defense: 95,
  tier: 13,
  rangeType: EntityAttackType.Melee,
  basePrice: 130,
  entityEffects: [EntityEffectBlueprint.Freezing],
  entityEffectChance: 80,
  equippedBuff: {
    type: CharacterBuffType.CharacterAttribute,
    trait: CharacterAttributes.MaxHealth,
    buffPercentage: 6,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of max health flowing through your body. (+6% MaxHealth)",
        deactivation: "You feel the power of max health leaving your body. (-6% MaxHealth)",
      },
    },
  },
  equippedBuffDescription: "Increases max health by 6% respectively",
};
