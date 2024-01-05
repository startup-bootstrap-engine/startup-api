import { QuestsBlueprint } from "../../questsBlueprintTypes";
import { questKillDeers } from "./QuestKillDeers";
import { questKillDwarfs } from "./QuestKillDwarfs";
import { questKillFrostSalamanders } from "./QuestKillFrostSalamanders";
import { questKillGiantSpiders } from "./QuestKillGiantSpiders";
import { questKillGoblins } from "./QuestKillGoblins";
import { questKillNazgul } from "./QuestKillNazgul";
import { questKillOrcWarlord } from "./QuestKillOrcWarlord";
import { questKillPolarBears } from "./QuestKillPolarBears";
import { questKillRats } from "./QuestKillRats";
import { questKillWinterWolves } from "./QuestKillWinterWolves";
import { questKillWolves } from "./QuestKillWolves";
import { questKillYetis } from "./QuestKillYetis";
import { questOrcFortress } from "./QuestOrcFortress";

export const killQuests = {
  [QuestsBlueprint.OrcFortress]: questOrcFortress,
  [QuestsBlueprint.KillRats]: questKillRats,
  [QuestsBlueprint.KillDeers]: questKillDeers,
  [QuestsBlueprint.KillWolves]: questKillWolves,
  [QuestsBlueprint.KillFrostSalamanders]: questKillFrostSalamanders,
  [QuestsBlueprint.KillGoblins]: questKillGoblins,
  [QuestsBlueprint.KillPolarBears]: questKillPolarBears,
  [QuestsBlueprint.KillWinterWolves]: questKillWinterWolves,
  [QuestsBlueprint.KillYetis]: questKillYetis,
  [QuestsBlueprint.KillNazguls]: questKillNazgul,
  [QuestsBlueprint.KillGiantSpiders]: questKillGiantSpiders,
  [QuestsBlueprint.KillDwarfs]: questKillDwarfs,
  [QuestsBlueprint.KillOrcWarlord]: questKillOrcWarlord,
};
