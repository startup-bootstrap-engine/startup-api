import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { npcBattleCompanion } from "./NPCBattleCompanion";
import { npcBattleCompanionMagic } from "./NPCBattleCompanionMagic";
import { npcBlueDragon } from "./NPCBlueDragon";
import { npcCaveCyclops } from "./NPCCaveCyclops";
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
import { npcElderGolem } from "./NPCElderGolem";
import { npcFellbeast } from "./NPCFellbeast";
import { npcForestCyclops } from "./NPCForestCyclops";
import { npcHighElf } from "./NPCHighElf";
import { npcIceCyclops } from "./NPCIceCyclop";
import { npcKobold } from "./NPCKobold";
import { npcNazgul } from "./NPCNazgul";
import { npcNightFellbeast } from "./NPCNightFellbeast";
import { npcOrcWarlord } from "./NPCOrcWarlord";
import { npcPandaBear } from "./NPCPandaBear";
import { npcPurpleDragon } from "./NPCPurpleDragon";
import { npcRedDragon } from "./NPCRedDragon";
import { npcWildCyclops } from "./NPCWildCyclops";
import { npcYellowDragon } from "./NPCYellowDragon";
import { npcYeti } from "./bosses/NPCYeti";
import { npcRat } from "./tier0/NPCRat";
import { npcSpider } from "./tier0/NPCSpider";
import { npcBat } from "./tier1/NPCBat";
import { npcSpiderling } from "./tier1/NPCSpiderling";
import { npcWolf } from "./tier1/NPCWolf";
import { npcIceFox } from "./tier10/NPCIceFox";
import { npcMudGolem } from "./tier10/NPCMudGolem";
import { npcFireFox } from "./tier11/NPCFireFox";
import { npcIceTroll } from "./tier11/NPCIceTroll";
import { npcDwarfGuardian } from "./tier12/NPCDwarfGuardian";
import { npcMinotaurArcher } from "./tier12/NPCMinotaursArcher";
import { npcMinotaurBerserker } from "./tier12/NPCMinotaursBerserker";
import { npcOrcRaider } from "./tier12/NPCOrcRaider";
import { npcTroll } from "./tier12/NPCTroll";
import { npcWraith } from "./tier12/NPCWraith";
import { npcCaveTroll } from "./tier13/NPCCaveTroll";
import { npcForestTroll } from "./tier13/NPCForestTroll";
import { npcWildTroll } from "./tier13/NPCWildTroll";
import { npcLitch } from "./tier14/NPCLitch";
import { npcTrollWarrior } from "./tier14/NPCTrollWarrior";
import { npcMinotaurMage } from "./tier15/NPCMinotaursMage";
import { npcTrollBerserker } from "./tier15/NPCTrollBerserker";
import { npcGiantSpider } from "./tier16/NPCGiantSpider";
import { npcStoneGolem } from "./tier16/NPCStoneGolem";
import { npcAssaultSpider } from "./tier2/NPCAssaultSpider";
import { npcCaveBat } from "./tier2/NPCCaveBat";
import { npcCentipede } from "./tier2/NPCCentipede";
import { npcRaccoon } from "./tier2/NPCRaccoon";
import { npcScorpion } from "./tier2/NPCScorpion";
import { npcSlime } from "./tier2/NPCSlime";
import { npcSnake } from "./tier2/NPCSnake";
import { npcWinterWolf } from "./tier2/NPCWinterWolf";
import { npcBlackEagle } from "./tier3/NPCBlackEagle";
import { npcBlackSpider } from "./tier3/NPCBlackSpider";
import { npcBrownBear } from "./tier3/NPCBrownBear";
import { npcCaveSpider } from "./tier3/NPCCaveSpider";
import { npcGhost } from "./tier3/NPCGhost";
import { npcGoblin } from "./tier3/NPCGoblin";
import { npcRedCentipede } from "./tier3/NPCRedCentipede";
import { npcSkeleton } from "./tier3/NPCSkeleton";
import { npcSparrow } from "./tier3/NPCSparrow";
import { npcBandit } from "./tier4/NPCBandit";
import { npcDwarf } from "./tier4/NPCDwarf";
import { npcElf } from "./tier4/NPCElf";
import { npcGhoul } from "./tier4/NPCGhoul";
import { npcGiantBat } from "./tier4/NPCGiantBat";
import { npcIceThing } from "./tier4/NPCIceThing";
import { npcOrc } from "./tier4/NPCOrc";
import { npcPolarBear } from "./tier4/NPCPolarBear";
import { npcFrostSalamander } from "./tier5/NPCFrostSalamander";
import { npcOrcWarrior } from "./tier5/NPCOrcWarrior";
import { npcSkeletonKnight } from "./tier5/NPCSkeletonKnight";
import { npcDwarfArcher } from "./tier6/NPCDwarfArcher";
import { npcMinotaur } from "./tier6/NPCMinotaur";
import { npcOrcArcher } from "./tier6/NPCOrcArcher";
import { npcDwarfGuard } from "./tier7/NPCDwarfGuard";
import { npcOrcBerserker } from "./tier7/NPCOrcBerserker";
import { npcOrcMage } from "./tier7/NPCOrcMage";
import { npcForestWalker } from "./tier8/NPCForestWalker";
import { npcDwarfMage } from "./tier9/NPCDwarfMage";

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
