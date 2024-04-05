import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ItemCraftableQueue } from "@providers/item/ItemCraftableQueue";
import { IPosition } from "@providers/movement/MovementHelper";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { MapLayers } from "@rpg-engine/shared";

export interface IUseWithTileEffect {
  (
    item: IItem,
    targetTile: IUseWithTargetTile,
    targetName: string | undefined,
    character: ICharacter,
    itemCraftable: ItemCraftableQueue,
    skillIncrease: SkillIncrease
  ): Promise<void> | void;
}

export interface IUseWithSeedEffect {
  (
    originItemKey: string,
    targetTile: IUseWithTargetSeed,
    targetName: string | undefined,
    character: ICharacter,
    itemCraftable: ItemCraftableQueue,
    skillIncrease: SkillIncrease
  ): Promise<void> | void;
}

export interface IUseWithItemEffect {
  (targetItem: IItem, originItem: IItem, character: ICharacter, skillIncrease: SkillIncrease): Promise<void> | void;
}

export interface IItemUseWith extends IItem {
  useWithMaxDistanceGrid: number;
  useWithItemEffect?: IUseWithItemEffect;
  useWithTileEffect?: IUseWithTileEffect;
}

export interface IUseWithItemValidationResponse {
  originItem: IItem;
  targetItem?: IItem;
  useWithItemEffect?: IUseWithItemEffect;
}

export interface IUseWithTileValidationResponse {
  originItem: IItem;
  useWithTileEffect?: IUseWithTileEffect;
  targetName?: string;
}

export interface IUseWithSeedValidationResponse {
  itemKey: string;
  targetSeed: IUseWithTargetSeed;
  plantKey: string;
  useWithTileEffect?: IUseWithSeedEffect;
}

export interface IMagicItemUseWithEntity extends IItem {
  useWithMaxDistanceGrid: number;
  power: number;
  animationKey: string;
  projectileAnimationKey: string;
  minMagicLevelRequired: number;
}

export interface IMagicStaff extends IItem {
  projectileAnimationKey: string;
}

export interface IUseWithTargetTile {
  x: number;
  y: number;
  map: string;
  layer: MapLayers;
}

export interface IUseWithCraftingRecipeItem {
  key: string;
  qty: number;
}

export interface IUseWithCraftingRecipe {
  outputKey: string;
  outputQtyRange: [number, number];
  requiredItems: IUseWithCraftingRecipeItem[];
  minCraftingRequirements: [string, number];
}

export interface IUseWithTargetSeed {
  coordinates: IPosition;
  map: string;
}
