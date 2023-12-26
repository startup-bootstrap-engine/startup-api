import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ItemCraftable } from "@providers/item/ItemCraftable";
import { SeedsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { IUseWithTargetTile } from "@providers/useWith/useWithTypes";
import { EntityAttackType, IUseWithItemBlueprint, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";

export const itemCabbageSeed: IUseWithItemBlueprint = {
  key: SeedsBlueprint.CabbageSeed,
  type: ItemType.Other,
  subType: ItemSubType.Seed,
  textureAtlas: "items",
  texturePath: "farm/seed-packs/seed-pack-green.png",
  name: "Cabbage Seed",
  description: "A small seed that grows into a cabbage. It requires fertile soil and enough water to grow.",
  weight: 0.01,
  hasUseWith: true,
  basePrice: 35,
  rangeType: EntityAttackType.None,
  useWithMaxDistanceGrid: RangeTypes.Short,
  canSell: true,
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
  usableEffectDescription: "Use it on a fertile soil to plant a cabbage",
};
