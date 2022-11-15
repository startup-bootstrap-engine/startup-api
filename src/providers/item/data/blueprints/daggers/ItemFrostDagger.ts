import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { DaggersBlueprint } from "../../types/itemsBlueprintTypes";

export const itemFrostDagger: Partial<IItem> = {
  key: DaggersBlueprint.FrostDagger,
  type: ItemType.Weapon,
  subType: ItemSubType.Dagger,
  textureAtlas: "items",
  texturePath: "daggers/frost-dagger.png",

  name: "Frost Dagger",
  description: "A dagger so cold that even holding it sends a chilling sensation down your spine.",
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  defense: 3,
  attack: 8,
  weight: 1,
  rangeType: EntityAttackType.Melee,
  basePrice: 45,
};
