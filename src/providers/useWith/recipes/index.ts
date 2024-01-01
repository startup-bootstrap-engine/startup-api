import { IItem } from "@entities/ModuleInventory/ItemModel";
import {
  SOCIAL_CRYSTAL_MIN_TIER_REQUIREMENT,
  SOCIAL_CRYSTAL_REQUIREMENT_RATIO,
} from "@providers/constants/CraftingConstants";
import { itemsBlueprintIndex } from "@providers/item/data";
import { CraftingResourcesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemSubType } from "@rpg-engine/shared";
import { IUseWithCraftingRecipe } from "../useWithTypes";
import { recipeAccessoriesIndex } from "./accessories/index";
import { recipeArmorsIndex } from "./armors/index";
import { recipeAxesIndex } from "./axes/index";
import { recipeBooksIndex } from "./books";
import { recipeBootsIndex } from "./boots/index";
import { recipeContainers } from "./containers";
import { recipeCraftingResources } from "./crafting-resources";
import { recipeDaggersIndex } from "./daggers/index";
import { recipeFoodsIndex } from "./foods/index";
import { recipeGlovesIndex } from "./gloves";
import { recipeHammersIndex } from "./hammers/index";
import { recipeHelmetsIndex } from "./helmets/index";
import { recipeLegsIndex } from "./legs/index";
import { recipeMacesIndex } from "./maces/index";
import { recipePotionsIndex } from "./potions";
import { recipeRangedIndex } from "./ranged-weapons/index";
import { recipeShieldsIndex } from "./shields/index";
import { recipeSpearsIndex } from "./spears/index";
import { recipeStaffsIndex } from "./staffs/index";
import { recipeSwordsIndex } from "./swords/index";

const recipeBlueprintsIndex: Record<string, IUseWithCraftingRecipe[]> = {
  ...recipeAccessoriesIndex,
  ...recipeArmorsIndex,
  ...recipeAxesIndex,
  ...recipeBooksIndex,
  ...recipeBootsIndex,
  ...recipeDaggersIndex,
  ...recipeFoodsIndex,
  ...recipeHelmetsIndex,
  ...recipeLegsIndex,
  ...recipeMacesIndex,
  ...recipeRangedIndex,
  ...recipeShieldsIndex,
  ...recipeSpearsIndex,
  ...recipeStaffsIndex,
  ...recipeSwordsIndex,
  ...recipeCraftingResources,
  ...recipeContainers,
  ...recipePotionsIndex,
  ...recipeGlovesIndex,
  ...recipeHammersIndex,
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/explicit-function-return-type
for (const recipe of Object.values(recipeBlueprintsIndex).flat()) {
  const itemBlueprint = itemsBlueprintIndex[recipe.outputKey] as IItem;

  if (!itemBlueprint) {
    continue;
  }

  if (
    itemBlueprint.subType === ItemSubType.CraftingResource ||
    itemBlueprint.subType === ItemSubType.Food ||
    itemBlueprint.subType === ItemSubType.Potion
  ) {
    continue;
  }

  // Add social crystal as requirement to strong items
  if (itemBlueprint.tier && itemBlueprint.tier >= SOCIAL_CRYSTAL_MIN_TIER_REQUIREMENT) {
    recipe.requiredItems.push({
      key: CraftingResourcesBlueprint.SocialCrystal,
      qty: Math.floor(itemBlueprint.tier * SOCIAL_CRYSTAL_REQUIREMENT_RATIO) ?? 1,
    });
  }
}
export { recipeBlueprintsIndex };
