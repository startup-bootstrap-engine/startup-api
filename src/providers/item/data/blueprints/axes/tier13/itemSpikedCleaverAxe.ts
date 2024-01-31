import { IEquippableMeleeTier13WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSpikedCleaverAxe: IEquippableMeleeTier13WeaponBlueprint = {
  key: AxesBlueprint.SpikedCleaverAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/spiked-cleaver-axe.png",
  name: "Spiked Cleaver Axe",
  description: "Sharp chopper with spikes for extra cutting and poking power.",
  weight: 4.9,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 94,
  defense: 93,
  tier: 13,
  rangeType: EntityAttackType.Melee,
  basePrice: 123,
};
