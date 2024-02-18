import { IEquippableMeleeTier17WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemCelestialSaber: IEquippableMeleeTier17WeaponBlueprint = {
  key: SwordsBlueprint.CelestialSaber,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/celestial-saber.png",
  name: "Celestial Saber",
  description:
    "Forged by celestial artisans, this saber shines with the light of distant stars, guiding the righteous to victory against darkness.",
  attack: 122,
  defense: 95,
  tier: 17,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 250,
};
