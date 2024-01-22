import { MagicsBlueprint } from "../../types/itemsBlueprintTypes";
import { itemBomb } from "./ItemBomb";
import { itemCorruptionRune } from "./ItemCorruptionRune";
import { itemDarkRune } from "./ItemDarkRune";
import { itemDungeonIlyaTeleport } from "./ItemDungeonIlyaTeleport";
import { itemDwarfMinesTeleport } from "./ItemDwarfMinesTeleport";
import { itemEnergyBoltRune } from "./itemEnergyBoltRune";
import { itemFireBoltRune } from "./itemFireBoltRune";
import { itemFireRune } from "./ItemFireRune";
import { itemFrostIslandCavesTeleport } from "./ItemFrostIslandCavesTeleport";
import { itemFrozenCastleDungeonTeleport } from "./ItemFrozenCastleDungeonTeleport";
import { itemFrozenIslandTeleport } from "./ItemFrozenIslandTeleport";
import { itemHealRune } from "./ItemHealRune";
import { itemMinotaursIslandTeleport } from "./ItemMinotaursIslandTeleport";
import { itemPoisonRune } from "./ItemPoisonRune";
import { itemRavenfallSanctuaryTeleport } from "./ItemRavenfallSanctuaryTeleport";
import { itemRune } from "./ItemRune";
import { itemShadowlandsSewerTeleport } from "./ItemShadowlandsSewerTeleport";
import { itemShadowlandsTeleport } from "./ItemShadowlandsTeleport";
import { itemThunderRune } from "./ItemThunderRune";
import { itemTrollsCavesTeleport } from "./ItemTrollsCavesTeleport";
import { itemWildwoodDungeonTeleport } from "./ItemWildwoodDungeonTeleport";
import { itemWildwoodTeleport } from "./ItemWildwoodTeleport";

export const magicsBlueprintIndex = {
  [MagicsBlueprint.Rune]: itemRune,
  [MagicsBlueprint.DarkRune]: itemDarkRune,
  [MagicsBlueprint.FireRune]: itemFireRune,
  [MagicsBlueprint.HealRune]: itemHealRune,
  [MagicsBlueprint.PoisonRune]: itemPoisonRune,
  [MagicsBlueprint.EnergyBoltRune]: itemEnergyBoltRune,
  [MagicsBlueprint.FireBoltRune]: itemFireBoltRune,
  [MagicsBlueprint.CorruptionRune]: itemCorruptionRune,
  [MagicsBlueprint.ThunderRune]: itemThunderRune,
  [MagicsBlueprint.WildwoodTeleport]: itemWildwoodTeleport,
  [MagicsBlueprint.DungeonIlyaTeleport]: itemDungeonIlyaTeleport,
  [MagicsBlueprint.DwarfMinesTeleport]: itemDwarfMinesTeleport,
  [MagicsBlueprint.FrostIslandCavesTeleport]: itemFrostIslandCavesTeleport,
  [MagicsBlueprint.FrozenCastleDungeonTeleport]: itemFrozenCastleDungeonTeleport,
  [MagicsBlueprint.FrozenIslandTeleport]: itemFrozenIslandTeleport,
  [MagicsBlueprint.MinotaursIslandTeleport]: itemMinotaursIslandTeleport,
  [MagicsBlueprint.RavenfallSanctuaryTeleport]: itemRavenfallSanctuaryTeleport,
  [MagicsBlueprint.ShadowlandsSewerTeleport]: itemShadowlandsSewerTeleport,
  [MagicsBlueprint.ShadowlandsTeleport]: itemShadowlandsTeleport,
  [MagicsBlueprint.TrollsCavesTeleport]: itemTrollsCavesTeleport,
  [MagicsBlueprint.WildwoodDungeonTeleport]: itemWildwoodDungeonTeleport,
  [MagicsBlueprint.Bomb]: itemBomb,
};
