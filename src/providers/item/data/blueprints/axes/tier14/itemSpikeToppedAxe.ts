import { IEquippableMeleeTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemSpikeToppedAxe: IEquippableMeleeTier14WeaponBlueprint = {
  key: AxesBlueprint.SpikeToppedAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/spike-topped-axe.png",
  name: "Spike Topped Axe",
  description: "Piercing spikes heighten impact, creating a formidable combat presence.",
  weight: 5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 106,
  defense: 104,
  tier: 14,
  rangeType: EntityAttackType.Melee,
  basePrice: 132,
};
