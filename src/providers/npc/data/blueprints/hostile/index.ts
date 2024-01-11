import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { npcBattleCompanion } from "./NPCBattleCompanion";
import { npcBattleCompanionMagic } from "./NPCBattleCompanionMagic";
import { npcBlueDragon } from "./NPCBlueDragon";
import { npcCaveCyclops } from "./NPCCaveCyclops";
import { npcCaveTroll } from "./NPCCaveTroll";
import { npcConde } from "./NPCConde";
import { npcCondessa } from "./NPCCondessa";
import { npcCorruptedCyclops } from "./NPCCorruptedCyclops";
import { npcCyclops } from "./NPCCyclops";
import { npcCyclopsWarrior } from "./NPCCyclopsWarrior";
import { npcDarkElf } from "./NPCDarkElf";
import { npcDarkKnight } from "./NPCDarkKnight";
import { npcDarkWraith } from "./NPCDarkWraith";
import { npcDragonKnight } from "./NPCDragonKnight";
import { npcDragonServant } from "./NPCDragonServant";
import { npcDwarfArcher } from "./NPCDwarfArcher";
import { npcDwarfGuard } from "./NPCDwarfGuard";
import { npcDwarfGuardian } from "./NPCDwarfGuardian";
import { npcDwarfMage } from "./NPCDwarfMage";
import { npcElderGolem } from "./NPCElderGolem";
import { npcFellbeast } from "./NPCFellbeast";
import { npcFireFox } from "./NPCFireFox";
import { npcForestCyclops } from "./NPCForestCyclops";
import { npcForestTroll } from "./NPCForestTroll";
import { npcForestWalker } from "./NPCForestWalker";
import { npcFrostSalamander } from "./NPCFrostSalamander";
import { npcGiantBat } from "./NPCGiantBat";
import { npcGiantSpider } from "./NPCGiantSpider";
import { npcGoblin } from "./NPCGoblin";
import { npcHighElf } from "./NPCHighElf";
import { npcIceCyclops } from "./NPCIceCyclop";
import { npcIceFox } from "./NPCIceFox";
import { npcIceThing } from "./NPCIceThing";
import { npcIceTroll } from "./NPCIceTroll";
import { npcKobold } from "./NPCKobold";
import { npcLitch } from "./NPCLitch";
import { npcMinotaur } from "./NPCMinotaur";
import { npcMinotaurArcher } from "./NPCMinotaursArcher";
import { npcMinotaurBerserker } from "./NPCMinotaursBerserker";
import { npcMinotaurMage } from "./NPCMinotaursMage";
import { npcMudGolem } from "./NPCMudGolem";
import { npcNazgul } from "./NPCNazgul";
import { npcNightFellbeast } from "./NPCNightFellbeast";
import { npcOrc } from "./NPCOrc";
import { npcOrcArcher } from "./NPCOrcArcher";
import { npcOrcBerserker } from "./NPCOrcBerserker";
import { npcOrcMage } from "./NPCOrcMage";
import { npcOrcRaider } from "./NPCOrcRaider";
import { npcOrcWarlord } from "./NPCOrcWarlord";
import { npcOrcWarrior } from "./NPCOrcWarrior";
import { npcPandaBear } from "./NPCPandaBear";
import { npcPolarBear } from "./NPCPolarBear";
import { npcPurpleDragon } from "./NPCPurpleDragon";
import { npcRaccoon } from "./NPCRaccoon";
import { npcRedCentipede } from "./NPCRedCentipede";
import { npcRedDragon } from "./NPCRedDragon";
import { npcScorpion } from "./NPCScorpion";
import { npcSlime } from "./NPCSlime";
import { npcSnake } from "./NPCSnake";
import { npcSparrow } from "./NPCSparrow";
import { npcSpiderling } from "./NPCSpiderling";
import { npcStoneGolem } from "./NPCStoneGolem";
import { npcTroll } from "./NPCTroll";
import { npcTrollBerserker } from "./NPCTrollBerserker";
import { npcTrollWarrior } from "./NPCTrollWarrior";
import { npcWildCyclops } from "./NPCWildCyclops";
import { npcWildTroll } from "./NPCWildTroll";
import { npcWraith } from "./NPCWraith";
import { npcYellowDragon } from "./NPCYellowDragon";
import { npcYeti } from "./bosses/NPCYeti";
import { npcRat } from "./tier0/NPCRat";
import { npcSpider } from "./tier0/NPCSpider";
import { npcBat } from "./tier1/NPCBat";
import { npcWolf } from "./tier1/NPCWolf";
import { npcAssaultSpider } from "./tier2/NPCAssaultSpider";
import { npcCaveBat } from "./tier2/NPCCaveBat";
import { npcCentipede } from "./tier2/NPCCentipede";
import { npcWinterWolf } from "./tier2/NPCWinterWolf";
import { npcBlackEagle } from "./tier3/NPCBlackEagle";
import { npcBlackSpider } from "./tier3/NPCBlackSpider";
import { npcBrownBear } from "./tier3/NPCBrownBear";
import { npcCaveSpider } from "./tier3/NPCCaveSpider";
import { npcGhost } from "./tier3/NPCGhost";
import { npcSkeleton } from "./tier3/NPCSkeleton";
import { npcBandit } from "./tier4/NPCBandit";
import { npcDwarf } from "./tier4/NPCDwarf";
import { npcElf } from "./tier4/NPCElf";
import { npcGhoul } from "./tier4/NPCGhoul";
import { npcSkeletonKnight } from "./tier5/NPCSkeletonKnight";

export const hostileNPCs = {
  [HostileNPCsBlueprint.Orc]: npcOrc,
  [HostileNPCsBlueprint.OrcWarrior]: npcOrcWarrior,
  [HostileNPCsBlueprint.OrcBerserker]: npcOrcBerserker,
  [HostileNPCsBlueprint.OrcMage]: npcOrcMage,
  [HostileNPCsBlueprint.OrcArcher]: npcOrcArcher,
  [HostileNPCsBlueprint.Skeleton]: npcSkeleton,
  [HostileNPCsBlueprint.Rat]: npcRat,
  [HostileNPCsBlueprint.SkeletonKnight]: npcSkeletonKnight,
  [HostileNPCsBlueprint.Bat]: npcBat,
  [HostileNPCsBlueprint.Ghost]: npcGhost,
  [HostileNPCsBlueprint.Minotaur]: npcMinotaur,
  [HostileNPCsBlueprint.Slime]: npcSlime,
  [HostileNPCsBlueprint.Wolf]: npcWolf,
  [HostileNPCsBlueprint.Ghoul]: npcGhoul,
  [HostileNPCsBlueprint.Spider]: npcSpider,
  [HostileNPCsBlueprint.Dwarf]: npcDwarf,
  [HostileNPCsBlueprint.DwarfGuard]: npcDwarfGuard,
  [HostileNPCsBlueprint.RedDragon]: npcRedDragon,
  [HostileNPCsBlueprint.BlueDragon]: npcBlueDragon,
  [HostileNPCsBlueprint.YellowDragon]: npcYellowDragon,
  [HostileNPCsBlueprint.PurpleDragon]: npcPurpleDragon,
  [HostileNPCsBlueprint.Troll]: npcTroll,
  [HostileNPCsBlueprint.WildTroll]: npcWildTroll,
  [HostileNPCsBlueprint.TrollWarrior]: npcTrollWarrior,
  [HostileNPCsBlueprint.TrollBerserker]: npcTrollBerserker,
  [HostileNPCsBlueprint.ForestTroll]: npcForestTroll,
  [HostileNPCsBlueprint.CaveTroll]: npcCaveTroll,
  [HostileNPCsBlueprint.Goblin]: npcGoblin,
  [HostileNPCsBlueprint.BrownBear]: npcBrownBear,
  [HostileNPCsBlueprint.PandaBear]: npcPandaBear,
  [HostileNPCsBlueprint.PolarBear]: npcPolarBear,
  [HostileNPCsBlueprint.WinterWolf]: npcWinterWolf,
  [HostileNPCsBlueprint.FrostSalamander]: npcFrostSalamander,
  [HostileNPCsBlueprint.Bandit]: npcBandit,
  [HostileNPCsBlueprint.Yeti]: npcYeti,
  [HostileNPCsBlueprint.IceTroll]: npcIceTroll,
  [HostileNPCsBlueprint.Scorpion]: npcScorpion,
  [HostileNPCsBlueprint.BlackSpider]: npcBlackSpider,
  [HostileNPCsBlueprint.AssaultSpider]: npcAssaultSpider,
  [HostileNPCsBlueprint.CaveSpider]: npcCaveSpider,
  [HostileNPCsBlueprint.Centipede]: npcCentipede,
  [HostileNPCsBlueprint.ElderGolem]: npcElderGolem,
  [HostileNPCsBlueprint.FireFox]: npcFireFox,
  [HostileNPCsBlueprint.ForestWalker]: npcForestWalker,
  [HostileNPCsBlueprint.GiantBat]: npcGiantBat,
  [HostileNPCsBlueprint.IceFox]: npcIceFox,
  [HostileNPCsBlueprint.MudGolem]: npcMudGolem,
  [HostileNPCsBlueprint.Raccoon]: npcRaccoon,
  [HostileNPCsBlueprint.RedCentipede]: npcRedCentipede,
  [HostileNPCsBlueprint.Sparrow]: npcSparrow,
  [HostileNPCsBlueprint.Snake]: npcSnake,
  [HostileNPCsBlueprint.Spiderling]: npcSpiderling,
  [HostileNPCsBlueprint.StoneGolem]: npcStoneGolem,
  [HostileNPCsBlueprint.Elf]: npcElf,
  [HostileNPCsBlueprint.HighElf]: npcHighElf,
  [HostileNPCsBlueprint.GiantSpider]: npcGiantSpider,
  [HostileNPCsBlueprint.BlackEagle]: npcBlackEagle,
  [HostileNPCsBlueprint.DwarfArcher]: npcDwarfArcher,
  [HostileNPCsBlueprint.DwarfGuardian]: npcDwarfGuardian,
  [HostileNPCsBlueprint.DwarfMage]: npcDwarfMage,
  [HostileNPCsBlueprint.Kobold]: npcKobold,
  [HostileNPCsBlueprint.Wraith]: npcWraith,
  [HostileNPCsBlueprint.DarkWraith]: npcDarkWraith,
  [HostileNPCsBlueprint.DragonKnight]: npcDragonKnight,
  [HostileNPCsBlueprint.IceThing]: npcIceThing,
  [HostileNPCsBlueprint.DarkKnight]: npcDarkKnight,
  [HostileNPCsBlueprint.Litch]: npcLitch,
  [HostileNPCsBlueprint.MinotaurArcher]: npcMinotaurArcher,
  [HostileNPCsBlueprint.MinotaurMage]: npcMinotaurMage,
  [HostileNPCsBlueprint.MinotaurBerserker]: npcMinotaurBerserker,
  [HostileNPCsBlueprint.DragonServant]: npcDragonServant,
  [HostileNPCsBlueprint.CaveBat]: npcCaveBat,
  [HostileNPCsBlueprint.CaveCyclops]: npcCaveCyclops,
  [HostileNPCsBlueprint.Conde]: npcConde,
  [HostileNPCsBlueprint.Condessa]: npcCondessa,
  [HostileNPCsBlueprint.Cyclops]: npcCyclops,
  [HostileNPCsBlueprint.CorruptedCyclops]: npcCorruptedCyclops,
  [HostileNPCsBlueprint.CyclopsWarrior]: npcCyclopsWarrior,
  [HostileNPCsBlueprint.ForestCyclops]: npcForestCyclops,
  [HostileNPCsBlueprint.IceCyclops]: npcIceCyclops,
  [HostileNPCsBlueprint.Nazgul]: npcNazgul,
  [HostileNPCsBlueprint.Fellbeast]: npcFellbeast,
  [HostileNPCsBlueprint.OrcRaider]: npcOrcRaider,
  [HostileNPCsBlueprint.NightFellbeast]: npcNightFellbeast,
  [HostileNPCsBlueprint.OrcWarlord]: npcOrcWarlord,
  [HostileNPCsBlueprint.WildCyclops]: npcWildCyclops,
  [HostileNPCsBlueprint.BattleCompanion]: npcBattleCompanion,
  [HostileNPCsBlueprint.BattleCompanionMagic]: npcBattleCompanionMagic,
  [HostileNPCsBlueprint.DarkElf]: npcDarkElf,
};
