import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier11WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemArrowheadDagger: IEquippableMeleeTier11WeaponBlueprint = {
  key: DaggersBlueprint.ArrowheadDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/arrowhead-dagger.png",
  name: "Arrowhead Dagger",
  description: "Sleek as an arrow, sharp tip, swift and deadly, a precise weapon for piercing strikes.",
  weight: 2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 83,
  defense: 76,
  tier: 11,
  rangeType: EntityAttackType.Melee,
  basePrice: 125,
  entityEffects: [EntityEffectBlueprint.Bleeding],
  entityEffectChance: 125,
};
