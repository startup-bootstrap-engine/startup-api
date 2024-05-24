import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemNightfallSplitter: IEquippableMeleeTier16WeaponBlueprint = {
  key: AxesBlueprint.NightfallSplitter,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/nightfall-splitter.png",
  name: "Nightfall Splitter",
  description: "A dark axe that severs the fabric of reality with each swing, plunging foes into eternal night.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 118,
  defense: 116,
  tier: 16,
  rangeType: EntityAttackType.Melee,
  basePrice: 141,
  entityEffects: [EntityEffectBlueprint.Poison],
  entityEffectChance: 94,
  equippedBuff: {
    type: CharacterBuffType.Skill,
    trait: BasicAttribute.Resistance,
    buffPercentage: 5,
    durationType: CharacterBuffDurationType.Permanent,
    options: {
      messages: {
        activation: "You feel the power of resistance flowing through your body. (+5% resistance)",
        deactivation: "You feel the power of resistance leaving your body. (-5% resistance)",
      },
    },
  },
  equippedBuffDescription: "Increases resistance by 5%",
};
