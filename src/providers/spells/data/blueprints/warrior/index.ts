import { SpellsBlueprint } from "@rpg-engine/shared";
import { spellBleedingEdge } from "./SpellBleedingEdge";
import { warriorSpellExecution } from "./SpellExecution";
import { spellFortifyDefense } from "./SpellFortifyDefense";
import { spellPhysicalShield } from "./SpellPhysicalShield";
import { spellPowerStrike } from "./SpellPowerStrike";
import { spellShieldBash } from "./SpellShieldBash";
import { spellStunTarget } from "./SpellStunTarget";

export const warriorSpellsIndex = {
  [SpellsBlueprint.SpellPhysicalShield]: spellPhysicalShield,
  [SpellsBlueprint.WarriorStunTarget]: spellStunTarget,
  [SpellsBlueprint.FortifyDefense]: spellFortifyDefense,
  [SpellsBlueprint.PowerStrike]: spellPowerStrike,
  [SpellsBlueprint.BleedingEdge]: spellBleedingEdge,
  [SpellsBlueprint.ShieldBash]: spellShieldBash,
  [SpellsBlueprint.WarriorExecution]: warriorSpellExecution,
};
