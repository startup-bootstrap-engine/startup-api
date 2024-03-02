import { BooksBlueprint } from "../../types/itemsBlueprintTypes";
import { itemArcaneArbiterChronicles } from "./ItemArcaneArbiterChronicles";
import { itemBook } from "./ItemBook";
import { itemEmberSageScripture } from "./ItemEmberSageScripture";
import { itemFrostWraithTome } from "./ItemFrostWraithTome";
import { itemMysticWardenCodex } from "./ItemMysticWardenCodex";
import { itemStormbringerGrimoire } from "./ItemStormbringerGrimoire";
import { itemElementalCodex } from "./tier0/itemElementalCodex";
import { itemEnchantedManuscript } from "./tier0/itemEnchantedManuscript";
import { itemMysticCompendium } from "./tier0/itemMysticCompendium";
import { itemSpellboundCodex } from "./tier0/itemSpellboundCodex";
import { itemAstralAtlas } from "./tier1/itemAstralAtlas";
import { itemCelestialChronicles } from "./tier1/itemCelestialChronicles";
import { itemDruidicLoreVolume } from "./tier1/itemDruidicLoreVolume";
import { itemPotioncraftPrimer } from "./tier1/itemPotioncraftPrimer";
import { itemElementalGrimoire } from "./tier2/ElementalGrimoire";
import { itemArcaneArchives } from "./tier2/itemArcaneArchives";
import { itemEnigmaScrolls } from "./tier2/itemEnigmaScrolls";
import { itemMysticalMemoirs } from "./tier2/itemMysticalMemoirs";
import { itemEsotericEpistles } from "./tier3/itemEsotericEpistles";
import { itemEtherealTomes } from "./tier3/itemEtherealTomes";
import { itemLoreVolume } from "./tier3/itemLoreVolume";
import { itemMysticalTomes } from "./tier3/itemMysticalTomes";
import { itemAlchemistsAlmanac } from "./tier4/itemAlchemistsAlmanac";
import { itemSoulCrystal } from "./tier5/itemSoulCrystal";
import { itemElementalSphere } from "./tier5/itemElementalSphere";
import { itemMagicOrb } from "./tier6/itemMagicOrb";
import { itemAstralGlobe } from "./tier6/itemAstralGlobe";
import { itemEtherealSphere } from "./tier7/itemEtherealSphere";
import { itemMysteryOrb } from "./tier7/itemMysteryOrb";

export const booksBlueprintIndex = {
  [BooksBlueprint.Book]: itemBook,
  [BooksBlueprint.ArcaneArbiterChronicles]: itemArcaneArbiterChronicles,
  [BooksBlueprint.EmberSageScripture]: itemEmberSageScripture,
  [BooksBlueprint.FrostWraithTome]: itemFrostWraithTome,
  [BooksBlueprint.MysticWardenCodex]: itemMysticWardenCodex,
  [BooksBlueprint.StormbringerGrimoire]: itemStormbringerGrimoire,
  [BooksBlueprint.ElementalCodex]: itemElementalCodex,
  [BooksBlueprint.EnchantedManuscript]: itemEnchantedManuscript,
  [BooksBlueprint.MysticCompendium]: itemMysticCompendium,
  [BooksBlueprint.SpellboundCodex]: itemSpellboundCodex,
  [BooksBlueprint.AstralAtlas]: itemAstralAtlas,
  [BooksBlueprint.CelestialChronicles]: itemCelestialChronicles,
  [BooksBlueprint.DruidicLoreVolume]: itemDruidicLoreVolume,
  [BooksBlueprint.PotioncraftPrimer]: itemPotioncraftPrimer,
  [BooksBlueprint.ElementalGrimoire]: itemElementalGrimoire,
  [BooksBlueprint.ArcaneArchives]: itemArcaneArchives,
  [BooksBlueprint.EnigmaScrolls]: itemEnigmaScrolls,
  [BooksBlueprint.MysticalMemoirs]: itemMysticalMemoirs,
  [BooksBlueprint.EsotericEpistles]: itemEsotericEpistles,
  [BooksBlueprint.EtherealTomes]: itemEtherealTomes,
  [BooksBlueprint.LoreVolume]: itemLoreVolume,
  [BooksBlueprint.MysticalTomes]: itemMysticalTomes,
  [BooksBlueprint.AlchemistsAlmanac]: itemAlchemistsAlmanac,
  [BooksBlueprint.SoulCrystal]: itemSoulCrystal,
  [BooksBlueprint.ElementalSphere]: itemElementalSphere,
  [BooksBlueprint.MysteryOrb]: itemMysteryOrb,
  [BooksBlueprint.MagicOrb]: itemMagicOrb,
  [BooksBlueprint.AstralGlobe]: itemAstralGlobe,
  [BooksBlueprint.EtherealSphere]: itemEtherealSphere,
};
