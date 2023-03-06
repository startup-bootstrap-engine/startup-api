import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeArrow } from "./recipeArrow";
import { recipeBolt } from "./recipeBolt";
import { recipeBow } from "./recipeBow";
import { recipeCrossBow } from "./recipeCrossBow";
import { recipeDragonBow } from "./recipeDragonBow";
import { recipeGoldenArrow } from "./recipeGoldenArrow";
import { recipeHadesBow } from "./recipeHadesBow";
import { recipeIronArrow } from "./recipeIronArrow";
import { recipeLightingCrossbow } from "./recipeLightingCrossbow";
import { recipePhoenixBow } from "./recipePhoenixBow";
import { recipePoisonArrow } from "./recipePoisonArrow";
import { recipeRuneBow } from "./recipeRuneBow";
import { recipeShockArrow } from "./recipeShockArrow";
import { recipeStormBow } from "./recipeStormBow";
import { recipeSunstoneBow } from "./recipeSunstoneBow";
import { recipeValkyriesBow } from "./recipeValkyriesBow";
import { recipeZephyrusBow } from "./recipeZephyrusBow";

export const recipeRangedIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [RangedWeaponsBlueprint.Arrow]: [recipeArrow],
  [RangedWeaponsBlueprint.IronArrow]: [recipeIronArrow],
  [RangedWeaponsBlueprint.PoisonArrow]: [recipePoisonArrow],
  [RangedWeaponsBlueprint.Bolt]: [recipeBolt],
  [RangedWeaponsBlueprint.Bow]: [recipeBow],
  [RangedWeaponsBlueprint.DragonBow]: [recipeDragonBow],
  [RangedWeaponsBlueprint.HadesBow]: [recipeHadesBow],
  [RangedWeaponsBlueprint.Crossbow]: [recipeCrossBow],
  [RangedWeaponsBlueprint.GoldenArrow]: [recipeGoldenArrow],
  [RangedWeaponsBlueprint.LightningCrossbow]: [recipeLightingCrossbow],
  [RangedWeaponsBlueprint.PhoenixBow]: [recipePhoenixBow],
  [RangedWeaponsBlueprint.RuneBow]: [recipeRuneBow],
  [RangedWeaponsBlueprint.ShockArrow]: [recipeShockArrow],
  [RangedWeaponsBlueprint.StormBow]: [recipeStormBow],
  [RangedWeaponsBlueprint.SunstoneBow]: [recipeSunstoneBow],
  [RangedWeaponsBlueprint.ValkyriesBow]: [recipeValkyriesBow],
  [RangedWeaponsBlueprint.ZephyrusBow]: [recipeZephyrusBow],
};
