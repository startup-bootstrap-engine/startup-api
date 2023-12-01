import { SpellsBlueprint } from "@rpg-engine/shared";
import { spellCleavingStomp } from "./SpellCleavingStomp";
import { spellFocusSwitft } from "./SpellFocusSwift";

export const berserkerWarriorSpellsIndex = {
  [SpellsBlueprint.FocusSwift]: spellFocusSwitft,
  [SpellsBlueprint.CleavingStomp]: spellCleavingStomp,
};
