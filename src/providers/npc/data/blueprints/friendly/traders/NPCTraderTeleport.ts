import { INPC } from "@entities/ModuleNPC/NPCModel";
import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { CharacterGender, MagicsBlueprint } from "@rpg-engine/shared";
import { generateRandomMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcTraderTeleport = {
  ...generateRandomMovement(),
  key: "cyclops",
  name: "Mythic Merchant",
  textureKey: HostileNPCsBlueprint.CaveCyclops,
  gender: CharacterGender.Male,
  isTrader: true,
  traderItems: [
    {
      key: MagicsBlueprint.DungeonIlyaTeleport,
    },
    {
      key: MagicsBlueprint.DwarfMinesTeleport,
    },
    {
      key: MagicsBlueprint.FrostIslandCavesTeleport,
    },
    {
      key: MagicsBlueprint.FrozenCastleDungeonTeleport,
    },
    {
      key: MagicsBlueprint.FrozenIslandTeleport,
    },
    {
      key: MagicsBlueprint.MinotaursIslandTeleport,
    },
    {
      key: MagicsBlueprint.RavenfallSanctuaryTeleport,
    },
    {
      key: MagicsBlueprint.ShadowlandsSewerTeleport,
    },
    {
      key: MagicsBlueprint.ShadowlandsTeleport,
    },
    {
      key: MagicsBlueprint.TrollsCavesTeleport,
    },
    {
      key: MagicsBlueprint.WildwoodDungeonTeleport,
    },
    {
      key: MagicsBlueprint.WildwoodTeleport,
    },
  ],
} as Partial<INPC>;
