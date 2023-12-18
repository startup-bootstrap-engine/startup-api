import { SpellsBlueprint } from "@rpg-engine/shared";
import { spellBleedingEdge } from "./SpellBleedingEdge";
import { spellFortifyDefense } from "./SpellFortifyDefense";
import { spellPhysicalShield } from "./SpellPhysicalShield";
import { spellPowerStrike } from "./SpellPowerStrike";
import { spellStunTarget } from "./SpellStunTarget";
import { spellShieldBash } from "./SpellShieldBash";

export const warriorSpellsIndex = {
  [SpellsBlueprint.SpellPhysicalShield]: spellPhysicalShield,
  [SpellsBlueprint.WarriorStunTarget]: spellStunTarget,
  [SpellsBlueprint.FortifyDefense]: spellFortifyDefense,
  [SpellsBlueprint.PowerStrike]: spellPowerStrike,
  [SpellsBlueprint.BleedingEdge]: spellBleedingEdge,
  [SpellsBlueprint.ShieldBash]: spellShieldBash,
};
