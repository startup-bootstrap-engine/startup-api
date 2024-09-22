import { AccessoriesBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeAmuletOfDeath } from "./tier0/recipeAmuletOfDeath";
import { recipeAzureNecklace } from "./tier23/recipeAzureNecklace";
import { recipeBandana } from "./tier0/recipeBandana";
import { recipeBloodstoneAmulet } from "./tier13/recipeBloodstoneAmulet";
import { recipeCorruptionNecklace } from "./tier0/recipeCorruptionNecklace";
import { recipeDeathNecklace } from "./tier0/recipeDeathNecklace";
import { recipeElvenRing } from "./tier0/recipeElvenRing";
import { recipeEmeraldEleganceNecklace } from "./tier17/recipeEmeraldEleganceNecklace";
import { recipeGildedNecklace } from "./tier22/recipeGildedNecklace";
import { recipeGoldenGlimmerRing } from "./tier28/recipeGoldenGlimmerRing";
import { recipeGoldenGlowRing } from "./tier31/recipeGoldenGlowRing";
import { recipeHasteRing } from "./tier1/recipeHasteRing";
import { recipeOrcRing } from "./tier1/recipeOrcRing";
import { recipePendantOfLife } from "./tier0/recipePendantOfLife";
import { recipePendantOfMana } from "./tier0/recipePendantOfMana";
import { recipeSapphireSerenadeRing } from "./tier30/recipeSapphireSerenadeRing";
import { recipeScarletNecklace } from "./tier24/recipeScarletNecklace";
import { recipeTwilightEmberNecklace } from "./tier23/recipeTwilightEmberNecklace";
import { recipeGoldenRing } from "./tier2/recipeGoldenRing";
import { recipeJadeRing } from "./tier2/recipeJadeRing";
import { recipeSmokeRing } from "./tier26/recipeSmokeRing";

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
  [AccessoriesBlueprint.SmokeRing]: [recipeSmokeRing],
  [AccessoriesBlueprint.GoldenRing]: [recipeGoldenRing],
  [AccessoriesBlueprint.JadeRing]: [recipeJadeRing],
};
