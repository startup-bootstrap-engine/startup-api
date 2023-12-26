import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ItemCraftable } from "@providers/item/ItemCraftable";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { IUseWithTargetTile } from "@providers/useWith/useWithTypes";
import {
  EntityAttackType,
  IToolItemBlueprint,
  ItemSlotType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { ToolsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemScythe: IToolItemBlueprint = {
  key: ToolsBlueprint.Scythe,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  textureAtlas: "items",
  texturePath: "tools/scythe.png",
  name: "Scythe",
  description: "A tool primarily used for cutting grass or reaping crops.",
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  hasUseWith: true,
  basePrice: 80,
  rangeType: EntityAttackType.Melee,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  canSell: false,
  useWithTileEffect: async (
    originItem: IItem,
    targetTile: IUseWithTargetTile,
    targetName: string,
    character: ICharacter,
    itemCraftable: ItemCraftable,
    skillIncrease: SkillIncrease
  ): Promise<void> => {
    //! Not implemented yet
  },
  usableEffectDescription: "Use it on grass or crops to cut them",
};
