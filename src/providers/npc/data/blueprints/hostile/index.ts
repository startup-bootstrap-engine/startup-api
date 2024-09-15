import { HostileNPCsBlueprint } from "@providers/npc/data/types/npcsBlueprintTypes";
import { npcBattleCompanion } from "./other/NPCBattleCompanion";
import { npcBattleCompanionMagic } from "./other/NPCBattleCompanionMagic";
import { npcRat } from "./tier0/NPCRat";
import { npcSpider } from "./tier0/NPCSpider";
import { npcBat } from "./tier1/NPCBat";
import { npcRaccoon } from "./tier1/NPCRaccoon";
import { npcSnake } from "./tier1/NPCSnake";
import { npcSpiderling } from "./tier1/NPCSpiderling";
import { npcWolf } from "./tier1/NPCWolf";
import { npcIceFox } from "./tier10/NPCIceFox";
import { npcMudGolem } from "./tier10/NPCMudGolem";
import { npcAlphaWolf } from "./tier11/NPCAlphaWolf";
import { npcFireFox } from "./tier11/NPCFireFox";
import { npcIceOrc } from "./tier11/NPCIceOrc";
import { npcIceTroll } from "./tier11/NPCIceTroll";
import { npcDwarfGuardian } from "./tier12/NPCDwarfGuardian";
import { npcMinotaurArcher } from "./tier12/NPCMinotaursArcher";
import { npcMinotaurBerserker } from "./tier12/NPCMinotaursBerserker";
import { npcOrcRaider } from "./tier12/NPCOrcRaider";
import { npcTroll } from "./tier12/NPCTroll";
import { npcWraith } from "./tier12/NPCWraith";
import { npcCaveTroll } from "./tier13/NPCCaveTroll";
import { npcForestTroll } from "./tier13/NPCForestTroll";
import { npcHighElf } from "./tier13/NPCHighElf";
import { npcKobold } from "./tier13/NPCKobold";
import { npcWildTroll } from "./tier13/NPCWildTroll";
import { npcCyclops } from "./tier14/NPCCyclops";
import { npcLitch } from "./tier14/NPCLitch";
import { npcTrollWarrior } from "./tier14/NPCTrollWarrior";
import { npcBlackOrc } from "./tier15/NPCBlackOrc";
import { npcCaveCyclops } from "./tier15/NPCCaveCyclops";
import { npcCondessa } from "./tier15/NPCCondessa";
import { npcDarkKnight } from "./tier15/NPCDarkKnight";
import { npcDarkWraith } from "./tier15/NPCDarkWraith";
import { npcDemonSkeleton } from "./tier15/NPCDemonSkeleton";
import { npcForestCyclops } from "./tier15/NPCForestCyclops";
import { npcIceCyclops } from "./tier15/NPCIceCyclop";
import { npcMinotaurMage } from "./tier15/NPCMinotaurMage";
import { npcTrollBerserker } from "./tier15/NPCTrollBerserker";
import { npcConde } from "./tier16/NPCConde";
import { npcDarkElf } from "./tier16/NPCDarkElf";
import { npcDragonKnight } from "./tier16/NPCDragonKnight";
import { npcFireOrc } from "./tier16/NPCFireOrc";
import { npcForestOrc } from "./tier16/NPCForestOrc";
import { npcGiantSpider } from "./tier16/NPCGiantSpider";
import { npcOrcWarlord } from "./tier16/NPCOrcWarlord";
import { npcStoneGolem } from "./tier16/NPCStoneGolem";
import { npcWildCyclops } from "./tier16/NPCWildCyclops";
import { npcYeti } from "./tier16/NPCYeti";
import { npcForestKobold } from "./tier16/npcForestKobold";
import { npcBlackKobold } from "./tier17/NPCBlackKobold";
import { npcCyclopsWarrior } from "./tier17/NPCCyclopsWarrior";
import { npcDwarfKing } from "./tier17/NPCDwarfKing";
import { npcFellbeast } from "./tier17/NPCFellbeast";
import { npcNightFellbeast } from "./tier17/NPCNightFellbeast";
import { npcCorruptedCyclops } from "./tier18/NPCCorruptedCyclops";
import { npcCorruptedKobold } from "./tier18/NPCCorruptedKobold";
import { npcDragonServant } from "./tier18/NPCDragonServant";
import { npcElderGolem } from "./tier18/NPCElderGolem";
import { npcForestNaga } from "./tier18/NPCForestNaga";
import { npcNazgul } from "./tier18/NPCNazgul";
import { npcRedNaga } from "./tier19/NPCRedNaga";
import { npcAssaultSpider } from "./tier2/NPCAssaultSpider";
import { npcCaveBat } from "./tier2/NPCCaveBat";
import { npcCentipede } from "./tier2/NPCCentipede";
import { npcScorpion } from "./tier2/NPCScorpion";
import { npcSlime } from "./tier2/NPCSlime";
import { npcSparrow } from "./tier2/NPCSparrow";
import { npcWinterWolf } from "./tier2/NPCWinterWolf";
import { npcCorruptedNaga } from "./tier20/NPCCorruptedNaga";
import { npcFireNaga } from "./tier20/NPCFireNaga";
import { npcInfernoWidow } from "./tier20/NPCInfernoWidow";
import { npcRedDragon } from "./tier20/NPCRedDragon";
import { npcBlueDragon } from "./tier21/NPCBlueDragon";
import { npcCrimsonNaga } from "./tier21/NPCCrimsonNaga";
import { npcIceNaga } from "./tier21/NPCIceNaga";
import { npcVenomNaga } from "./tier22/NPCVenomNaga";
import { npcYellowDragon } from "./tier22/NPCYellowDragon";
import { npcBlackNaga } from "./tier23/NPCBlackNaga";
import { npcLavaGolem } from "./tier23/NPCLavaGolem";
import { npcPurpleDragon } from "./tier23/NPCPurpleDragon";
import { npcAncientDragon } from "./tier26/NPCAncientDragon";
import { npcNPCBalrog } from "./tier27/NPCBalrog";
import { npcBlackEagle } from "./tier3/NPCBlackEagle";
import { npcBlackSpider } from "./tier3/NPCBlackSpider";
import { npcBrownBear } from "./tier3/NPCBrownBear";
import { npcCaveSpider } from "./tier3/NPCCaveSpider";
import { npcGhost } from "./tier3/NPCGhost";
import { npcGoblin } from "./tier3/NPCGoblin";
import { npcRedCentipede } from "./tier3/NPCRedCentipede";
import { npcSkeleton } from "./tier3/NPCSkeleton";
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
import { npcPandaBear } from "./tier5/NPCPandaBear";
import { npcSkeletonKnight } from "./tier5/NPCSkeletonKnight";
import { npcDwarfArcher } from "./tier6/NPCDwarfArcher";
import { npcMinotaur } from "./tier6/NPCMinotaur";
import { npcOrcArcher } from "./tier6/NPCOrcArcher";
import { npcDwarfGuard } from "./tier7/NPCDwarfGuard";
import { npcOrcBerserker } from "./tier7/NPCOrcBerserker";
import { npcOrcMage } from "./tier7/NPCOrcMage";
import { npcForestWalker } from "./tier8/NPCForestWalker";
import { npcDwarfMage } from "./tier9/NPCDwarfMage";
import { npcBloodyShadow } from "./tier15/NPCBloodyShadow";
import { npcMadBloodGolem } from "./tier15/NPCMadBloodGolem";
import { npcBloodySkeletonWarrior } from "./tier16/NPCBloodySkeletonWarrior";
import { npcCursedGhost } from "./tier16/NPCCursedGhost";
import { npcBloodyBerserkTroll } from "./tier17/NPCBloodyBerserkTroll";

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
  [HostileNPCsBlueprint.InfernoWidow]: npcInfernoWidow,
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
  [HostileNPCsBlueprint.BlackNaga]: npcBlackNaga,
  [HostileNPCsBlueprint.CorruptedNaga]: npcCorruptedNaga,
  [HostileNPCsBlueprint.CrimsonNaga]: npcCrimsonNaga,
  [HostileNPCsBlueprint.FireNaga]: npcFireNaga,
  [HostileNPCsBlueprint.ForestNaga]: npcForestNaga,
  [HostileNPCsBlueprint.RedNaga]: npcRedNaga,
  [HostileNPCsBlueprint.IceNaga]: npcIceNaga,
  [HostileNPCsBlueprint.VenomNaga]: npcVenomNaga,
  [HostileNPCsBlueprint.BlackKobold]: npcBlackKobold,
  [HostileNPCsBlueprint.CorruptedKobold]: npcCorruptedKobold,
  [HostileNPCsBlueprint.ForestKobold]: npcForestKobold,
  [HostileNPCsBlueprint.AncientDragon]: npcAncientDragon,
  [HostileNPCsBlueprint.BlackOrc]: npcBlackOrc,
  [HostileNPCsBlueprint.IceOrc]: npcIceOrc,
  [HostileNPCsBlueprint.FireOrc]: npcFireOrc,
  [HostileNPCsBlueprint.ForestOrc]: npcForestOrc,
  [HostileNPCsBlueprint.DemonSkeleton]: npcDemonSkeleton,
  [HostileNPCsBlueprint.Balrog]: npcNPCBalrog,
  [HostileNPCsBlueprint.LavaGolem]: npcLavaGolem,
  [HostileNPCsBlueprint.AlphaWolf]: npcAlphaWolf,
  [HostileNPCsBlueprint.DwarfKing]: npcDwarfKing,
  [HostileNPCsBlueprint.BloodySkeletonWarrior]: npcBloodySkeletonWarrior,
  [HostileNPCsBlueprint.BloodyBerserkTroll]: npcBloodyBerserkTroll,
  [HostileNPCsBlueprint.BloodyShadow]: npcBloodyShadow,
  [HostileNPCsBlueprint.CursedGhost]: npcCursedGhost,
  [HostileNPCsBlueprint.MadBloodGolem]: npcMadBloodGolem,
};
