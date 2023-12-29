import { SpellsBlueprint } from "@rpg-engine/shared";
import { spellArrowCreation } from "../hunter/SpellArrowCreation";
import { spellBlankRuneCreation } from "./SpellBlankRuneCreation";
import { spellFireRuneCreation } from "./SpellFireRuneCreation";
import { spellFoodCreation } from "./SpellFoodCreation";
import { spellGreaterHealing } from "./SpellGreaterHealing";
import { spellPoisonRuneCreation } from "./SpellPoisonRuneCreation";
import { spellSelfHaste } from "./SpellSelfHaste";
import { spellSelfHealing } from "./SpellSelfHealing";
import { spellTeleport } from "./SpellTeleport";

export const allClassesSpellsIndex = {
  [SpellsBlueprint.SelfHealingSpell]: spellSelfHealing,
  [SpellsBlueprint.ArrowCreationSpell]: spellArrowCreation,
  [SpellsBlueprint.BlankRuneCreationSpell]: spellBlankRuneCreation,
  [SpellsBlueprint.FireRuneCreationSpell]: spellFireRuneCreation,
  [SpellsBlueprint.FoodCreationSpell]: spellFoodCreation,
  [SpellsBlueprint.GreaterHealingSpell]: spellGreaterHealing,
  [SpellsBlueprint.PoisonRuneCreationSpell]: spellPoisonRuneCreation,
  [SpellsBlueprint.SelfHasteSpell]: spellSelfHaste,
  [SpellsBlueprint.Teleport]: spellTeleport,
};
