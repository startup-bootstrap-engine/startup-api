import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableMeleeTier1WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemIronDagger: IEquippableMeleeTier1WeaponBlueprint = {
  key: DaggersBlueprint.IronDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/iron-dagger.png",
  name: "Iron Dagger",
  description:
    "The Iron Dagger is a small and lightweight weapon with a sharp and pointed blade. The handle is wrapped in leather or cloth to provide a comfortable grip for the wielder. Its blade is made of iron, which is a sturdy and reliable material that is ideal for making weapons. The Iron Dagger is a basic weapon that can be effective in the right hands.",
  weight: 1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 11,
  defense: 9,
  tier: 1,
  rangeType: EntityAttackType.Melee,
  basePrice: 42,
};