import { INPC } from "@entities/ModuleNPC/NPCModel";
import { blueprintManager } from "@providers/inversify/container";
import { BodiesBlueprint, EffectsBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { IItem, ItemSubType, ItemType } from "@rpg-engine/shared";

export function unassignedItemChecker(): void {
  const itemKeys = blueprintManager.getAllBlueprintKeys("items");

  const skippableItems: string[] = [
    BodiesBlueprint.CharacterBody,
    BodiesBlueprint.NPCBody,
    EffectsBlueprint.GroundBlood,
    ToolsBlueprint.UseWithTileTest,
  ];

  const results: any[] = [];

  itemKeys.forEach((itemKey) => {
    const itemData = blueprintManager.getBlueprint("items", itemKey) as IItem;

    if (itemData?.subType === ItemSubType.Food) {
      return;
    }
    if (itemData?.type === ItemType.CraftingResource) {
      return;
    }
    if (skippableItems.includes(itemKey)) {
      return;
    }
    if (
      itemData?.texturePath.includes("rune") ||
      itemData?.texturePath.includes("arrow") ||
      itemData?.texturePath.includes("bolt")
    ) {
      return;
    }

    const inRecipe = checkItemInRecipes(itemKey);
    const inLoot = checkItemInLoot(itemKey);
    const isOnTrader = checkTraderNPCs(itemKey);
    const isInQuest = checkInQuests(itemKey);

    if (!inRecipe && !inLoot && !isOnTrader && !isInQuest) {
      results.push(itemKey);
      console.warn(
        `⚠️: Item ${itemKey} is not added to any recipe output, NPC loot, or trader items. Result: Recipe=${inRecipe}, Loot=${inLoot}, Trader=${isOnTrader}, Quest=${isInQuest}`
      );
    }
  });

  console.log(`Total unassigned items: ${results.length}`);
}

function checkItemInRecipes(itemKey: string): boolean {
  const recipes = blueprintManager.getAllBlueprintValues<IUseWithCraftingRecipe>("recipes");

  return recipes.some((recipeData) => recipeData[0].outputKey === itemKey);
}

function checkItemInLoot(itemKey: string): boolean {
  const npcs = blueprintManager.getAllBlueprintValues<INPC>("npcs");
  return npcs.some((npc) => {
    return npc.loots && npc.loots.some((lootItem) => lootItem.itemBlueprintKey === itemKey);
  });
}

function checkTraderNPCs(itemKey: string): boolean {
  const npcs = blueprintManager.getAllBlueprintValues<INPC>("npcs");

  return npcs
    .filter((npc) => npc.isTrader)
    .some((npc) => {
      return npc.traderItems?.some((traderItem) => traderItem.key === itemKey);
    });
}

function checkInQuests(itemKey: string): boolean {
  const quests = blueprintManager.getAllBlueprintValues("quests");

  return quests.some((quest: any) => {
    return quest.rewards?.some((reward) => reward.itemKeys.includes(itemKey));
  });
}
