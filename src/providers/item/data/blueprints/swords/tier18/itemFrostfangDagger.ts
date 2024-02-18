import { IEquippableMeleeTier18WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemFrostfangDagger: IEquippableMeleeTier18WeaponBlueprint = {
  key: SwordsBlueprint.FrostfangDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/frostfang-dagger.png",
  name: "Frostfang Dagger",
  description:
    "Crafted from the teeth of ancient ice dragons, this dagger pierces through defenses with icy precision, leaving frostbite in its wake.",
  attack: 133,
  defense: 99,
  tier: 18,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 250,
};
