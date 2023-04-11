import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableMeleeTier4WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemPhoenixDagger: IEquippableMeleeTier4WeaponBlueprint = {
  key: DaggersBlueprint.PhoenixDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/phoenix-dagger.png",
  name: "Phoenix Dagger",
  description:
    "The Phoenix Dagger is a beautiful and deadly weapon, adorned with intricate gold and red designs that resemble the majestic bird from which it takes its name. The blade is made of a rare and durable metal, with a sharp edge honed to perfection.",
  weight: 0.8,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 32,
  defense: 30,
  tier: 4,
  rangeType: EntityAttackType.Melee,
  basePrice: 70,
};