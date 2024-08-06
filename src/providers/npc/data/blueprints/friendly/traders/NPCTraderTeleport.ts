import { INPC } from "@entities/ModuleNPC/NPCModel";
import { ContainersBlueprint, MagicsBlueprint, PotionsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { FriendlyNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { CharacterGender } from "@rpg-engine/shared";
import { generateRandomMovement } from "../../../abstractions/BaseNeutralNPC";

export const npcTraderTeleport = {
  ...generateRandomMovement(),
  key: FriendlyNPCsBlueprint.TraderTeleport,
  name: "Mythic Merchant",
  textureKey: "shadow-assassin",
  gender: CharacterGender.Male,
  isTrader: true,
  traderItems: [
    {
      key: ContainersBlueprint.AzureBackpack,
    },
    {
      key: ContainersBlueprint.EmeraldBackpack,
    },
    {
      key: PotionsBlueprint.GreaterManaPotion,
    },
    {
      key: PotionsBlueprint.GreaterLifePotion,
    },
    {
      key: PotionsBlueprint.ManaPotion,
    },
    {
      key: PotionsBlueprint.LifePotion,
    },

    {
      key: MagicsBlueprint.Rune,
    },
    {
      key: MagicsBlueprint.Bomb,
    },
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
