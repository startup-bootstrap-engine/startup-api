import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier9WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemFlameheartDagger: IEquippableMeleeTier9WeaponBlueprint = {
  key: DaggersBlueprint.FlameheartDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/flameheart-dagger.png",
  name: "Flameheart Dagger",
  description: "Dragonfire-forged steel, crimson glow, burns foes with every strike, an inferno in hand.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 71,
  defense: 70,
  tier: 9,
  rangeType: EntityAttackType.Melee,
  basePrice: 90,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 95,
};
