import { BooksBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeAlchemistsAlmanac } from "./recipeAlchemistsAlmanac";
import { recipeArcaneArbiterChronicles } from "./recipeArcaneArbiterChronicles";
import { recipeEmberSageScripture } from "./recipeEmberSageScripture";
import { recipeEnigmaScrolls } from "./recipeEnigmaScrolls";
import { recipeFrostWraithTome } from "./recipeFrostWraithTome";
import { recipeMysteryOrb } from "./recipeMysteryOrb";
import { recipeMysticWardenCodex } from "./recipeMysticWardenCodex";
import { recipePotioncraftPrimer } from "./recipePotioncraftPrimer";
import { recipeSpellboundCodex } from "./recipeSpellboundCodex";
import { recipeStormbringerGrimoire } from "./recipeStormbringerGrimoire";
import { recipeMagicOrb } from "./recipeMagicOrb";

export const recipeBooksIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [BooksBlueprint.ArcaneArbiterChronicles]: [recipeArcaneArbiterChronicles],
  [BooksBlueprint.EmberSageScripture]: [recipeEmberSageScripture],
  [BooksBlueprint.FrostWraithTome]: [recipeFrostWraithTome],
  [BooksBlueprint.MysticWardenCodex]: [recipeMysticWardenCodex],
  [BooksBlueprint.StormbringerGrimoire]: [recipeStormbringerGrimoire],
  [BooksBlueprint.AlchemistsAlmanac]: [recipeAlchemistsAlmanac],
  [BooksBlueprint.EnigmaScrolls]: [recipeEnigmaScrolls],
  [BooksBlueprint.PotioncraftPrimer]: [recipePotioncraftPrimer],
  [BooksBlueprint.SpellboundCodex]: [recipeSpellboundCodex],
  [BooksBlueprint.MysteryOrb]: [recipeMysteryOrb],
  [BooksBlueprint.MagicOrb]: [recipeMagicOrb],
};
