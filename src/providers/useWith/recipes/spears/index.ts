import { SpearsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeBlueAuroraSpear } from "./tier3/recipeBlueAuroraSpear";
import { recipeEarthbinderSpear } from "./tier4/recipeEarthbinderSpear";
import { recipeGuardianGlaive } from "./tier6/recipeGuardianGlaive";
import { recipeMushroomSpear } from "./tier3/recipeMushroomSpear";
import { recipeSpear } from "./tier0/recipeSpear";
import { recipeWhiteDragonSpear } from "./tier5/recipeWhiteDragonSpear";

export const recipeSpearsIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [SpearsBlueprint.Spear]: [recipeSpear],
  [SpearsBlueprint.BlueAuroraSpear]: [recipeBlueAuroraSpear],
  [SpearsBlueprint.EarthbinderSpear]: [recipeEarthbinderSpear],
  [SpearsBlueprint.MushroomSpear]: [recipeMushroomSpear],
  [SpearsBlueprint.WhiteDragonSpear]: [recipeWhiteDragonSpear],
  [SpearsBlueprint.GuardianGlaive]: [recipeGuardianGlaive],
};
