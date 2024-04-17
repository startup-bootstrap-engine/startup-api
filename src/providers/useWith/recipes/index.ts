import { IItem } from "@entities/ModuleInventory/ItemModel";
import {
  CRAFTING_SOCIAL_CRYSTAL_MAX_CAP_REQUIREMENT,
  CRAFTING_SOCIAL_CRYSTAL_MIN_TIER_REQUIREMENT,
  CRAFTING_SOCIAL_CRYSTAL_REQUIREMENT_RATIO,
} from "@providers/constants/MarketingReferralConstants";
import { RECIPE_REQUIREMENTS_RATIO } from "@providers/constants/RecipeConstants";
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
import { recipeGemsIndex } from "./gems/index";
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
import { recipeToolsIndex } from "./tools";

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
  ...recipeGemsIndex,
  ...recipeToolsIndex,
};

function addSocialCrystalAsRequirements(recipe: IUseWithCraftingRecipe, itemsBlueprintIndex: any): void {
  const itemBlueprint = itemsBlueprintIndex[recipe.outputKey] as IItem;

  if (!itemBlueprint) {
    return;
  }

  if (
    itemBlueprint.subType === ItemSubType.CraftingResource ||
    itemBlueprint.subType === ItemSubType.Food ||
    itemBlueprint.subType === ItemSubType.Potion
  ) {
    return;
  }

  let socialCrystalBaseRequirement = itemBlueprint.tier! * CRAFTING_SOCIAL_CRYSTAL_REQUIREMENT_RATIO;

  if (socialCrystalBaseRequirement > CRAFTING_SOCIAL_CRYSTAL_MAX_CAP_REQUIREMENT) {
    socialCrystalBaseRequirement = CRAFTING_SOCIAL_CRYSTAL_MAX_CAP_REQUIREMENT;
  }

  // Add social crystal as requirement to strong items
  if (itemBlueprint.tier && itemBlueprint.tier >= CRAFTING_SOCIAL_CRYSTAL_MIN_TIER_REQUIREMENT) {
    recipe.requiredItems.push({
      key: CraftingResourcesBlueprint.SocialCrystal,
      qty: Math.floor(socialCrystalBaseRequirement) ?? 1,
    });
  }
}

function adjustItemRequirements(recipe: IUseWithCraftingRecipe): void {
  recipe.requiredItems.forEach((item) => {
    if (item.key === CraftingResourcesBlueprint.SocialCrystal) {
      return;
    }

    let qty = Math.floor(item.qty * RECIPE_REQUIREMENTS_RATIO);

    if (qty < 1) {
      qty = 1;
    }

    item.qty = qty;
  });
}

for (const recipe of Object.values(recipeBlueprintsIndex).flat()) {
  addSocialCrystalAsRequirements(recipe, itemsBlueprintIndex);

  adjustItemRequirements(recipe);
}
export { recipeBlueprintsIndex };
