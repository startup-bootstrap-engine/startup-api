import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container } from "@providers/inversify/container";
import { ItemCraftableQueue } from "@providers/item/ItemCraftableQueue";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { UseWithItemToTile } from "@providers/useWith/abstractions/UseWithItemToTile";
import { IUseWithTargetTile } from "@providers/useWith/useWithTypes";
import {
  AnimationEffectKeys,
  CraftingSkill,
  EntityAttackType,
  IToolItemBlueprint,
  ItemRarities,
  ItemSlotType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { CraftingResourcesBlueprint, FoodsBlueprint, ToolsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemMoonlureFishingRod: IToolItemBlueprint = {
  key: ToolsBlueprint.MoonlureFishingRod,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  textureAtlas: "items",
  toolCategory: ToolsBlueprint.FishingRod,
  texturePath: "tools/moonlure-fishing-rod.png",
  name: "Moonlure Fishing Rod",
  description: "A tool primarily used to catch fish and crafting materials. It uses a moon-like lure to attract fish.",
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  hasUseWith: true,
  basePrice: 25000,
  rangeType: EntityAttackType.Melee,
  useWithMaxDistanceGrid: RangeTypes.Medium,

  canSell: false,
  useWithTileEffect: async (
    originItem: IItem,
    targetTile: IUseWithTargetTile,
    targetName: string,
    character: ICharacter,
    itemCraftable: ItemCraftableQueue,
    skillIncrease: SkillIncrease
  ): Promise<void> => {
    const useWithItemToTile = container.get<UseWithItemToTile>(UseWithItemToTile);
    const rarityOfTool = originItem.rarity ?? ItemRarities.Common;

    await useWithItemToTile.execute(
      character,
      {
        targetTile,
        requiredResource: {
          key: CraftingResourcesBlueprint.Worm,
          decrementQty: 2,
          errorMessage: "Sorry, you need 2x worms to fish.",
        },
        targetTileAnimationEffectKey: "fishing",

        successAnimationEffectKey: AnimationEffectKeys.LevelUp,
        errorAnimationEffectKey: "miss",
        errorMessages: [
          "Hmm... The moonlure didn't attract any fish.",
          "You didn't catch anything, even with the moonlure.",
          "The moonlure didn't work this time. Try again.",
          "Oops! The fish was attracted by the moonlure, but it got away.",
          "Erm... Nothing! Maybe the moonlure isn't glowing enough?",
        ],
        successMessages: [
          "You caught a fish with the moonlure!",
          "The moonlure attracted a big one! You caught a big fish!",
          "You're getting good at this moonlure fishing!",
          "Woooaah! The moonlure attracted a huge fish! You caught a big one!",
        ],

        rewards: [
          {
            key: FoodsBlueprint.WildSalmon,
            qty: [1, 3],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Fishing, 5, rarityOfTool),
          },
          {
            key: FoodsBlueprint.Tuna,
            qty: [2, 3],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Fishing, 7, rarityOfTool),
          },
          {
            key: FoodsBlueprint.BrownFish,
            qty: [1, 2],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Fishing, 10, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.SeaShell,
            qty: [1, 10],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Fishing, 5, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.NebulaSeahorn,
            qty: [1, 5],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Fishing, 3, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.NautilusShell,
            qty: [1, 4],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Fishing, 2, rarityOfTool),
          },
        ],
      },
      skillIncrease
    );
  },
  usableEffectDescription: "Use it on a fishing spot with a worm to catch a fish or crafting ingredients.",
};
