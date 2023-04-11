import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { IEquippableMeleeTier1WeaponBlueprint } from "../../../types/TierBlueprintTypes";
import { DaggersBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemRustedJitte: IEquippableMeleeTier1WeaponBlueprint = {
  key: DaggersBlueprint.RustedJitte,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/rusted-jitte.png",
  name: "Rusted Jitte",
  description:
    "The Rusted Jitte is a weapon that has seen better days. Its once shiny surface has become corroded and pitted, giving it a rough texture and a distinct orange-brown color. Despite its appearance, however, the Jitte is still a formidable weapon. The blade is still sharp and pointed, capable of delivering deadly strikes.",
  weight: 0.8,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 15,
  defense: 15,
  tier: 1,
  rangeType: EntityAttackType.Melee,
  basePrice: 36,
};