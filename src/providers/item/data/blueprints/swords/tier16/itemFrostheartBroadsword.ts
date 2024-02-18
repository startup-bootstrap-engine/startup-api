import { IEquippableMeleeTier16WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemFrostheartBroadsword: IEquippableMeleeTier16WeaponBlueprint = {
  key: SwordsBlueprint.FrostheartBroadsword,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/frostheart-broadsword.png",
  name: "Frostheart Broadsword",
  description:
    "Forged from the purest ice found deep within glaciers, this broadsword pulsates with a cold, heartless energy, freezing foes with every strike.",
  attack: 115,
  defense: 85,
  tier: 16,
  weight: 1.3,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 250,
};
