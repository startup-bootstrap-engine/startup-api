import { AccessoriesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeAmuletOfDeath } from "./recipeAmuletOfDeath";
import { recipeAzureNecklace } from "./recipeAzureNecklace";
import { recipeBandana } from "./recipeBandana";
import { recipeBloodstoneAmulet } from "./recipeBloodstoneAmulet";
import { recipeCorruptionNecklace } from "./recipeCorruptionNecklace";
import { recipeDeathNecklace } from "./recipeDeathNecklace";
import { recipeElvenRing } from "./recipeElvenRing";
import { recipeEmeraldEleganceNecklace } from "./recipeEmeraldEleganceNecklace";
import { recipeGildedNecklace } from "./recipeGildedNecklace";
import { recipeGoldenGlimmerRing } from "./recipeGoldenGlimmerRing";
import { recipeGoldenGlowRing } from "./recipeGoldenGlowRing";
import { recipeHasteRing } from "./recipeHasteRing";
import { recipeOrcRing } from "./recipeOrcRing";
import { recipePendantOfLife } from "./recipePendantOfLife";
import { recipePendantOfMana } from "./recipePendantOfMana";
import { recipeSapphireSerenadeRing } from "./recipeSapphireSerenadeRing";
import { recipeScarletNecklace } from "./recipeScarletNecklace";
import { recipeTwilightEmberNecklace } from "./recipeTwilightEmberNecklace";

export const recipeAccessoriesIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [AccessoriesBlueprint.Bandana]: [recipeBandana],
  [AccessoriesBlueprint.CorruptionNecklace]: [recipeCorruptionNecklace],
  [AccessoriesBlueprint.DeathNecklace]: [recipeDeathNecklace],
  [AccessoriesBlueprint.ElvenRing]: [recipeElvenRing],
  [AccessoriesBlueprint.HasteRing]: [recipeHasteRing],
  [AccessoriesBlueprint.OrcRing]: [recipeOrcRing],
  [AccessoriesBlueprint.PendantOfLife]: [recipePendantOfLife],
  [AccessoriesBlueprint.PendantOfMana]: [recipePendantOfMana],
  [AccessoriesBlueprint.AmuletOfDeath]: [recipeAmuletOfDeath],
  [AccessoriesBlueprint.BloodstoneAmulet]: [recipeBloodstoneAmulet],
  [AccessoriesBlueprint.EmeraldEleganceNecklace]: [recipeEmeraldEleganceNecklace],
  [AccessoriesBlueprint.AzureNecklace]: [recipeAzureNecklace],
  [AccessoriesBlueprint.GildedNecklace]: [recipeGildedNecklace],
  [AccessoriesBlueprint.GoldenGlimmerRing]: [recipeGoldenGlimmerRing],
  [AccessoriesBlueprint.GoldenGlowRing]: [recipeGoldenGlowRing],
  [AccessoriesBlueprint.SapphireSerenadeRing]: [recipeSapphireSerenadeRing],
  [AccessoriesBlueprint.ScarletNecklace]: [recipeScarletNecklace],
  [AccessoriesBlueprint.TwilightEmberNecklace]: [recipeTwilightEmberNecklace],
};
