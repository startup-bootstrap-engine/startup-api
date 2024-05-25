import { HammersBlueprint } from "../../types/itemsBlueprintTypes";
import { itemIronHammer } from "./tier0/ItemIronHammer";
import { itemDragonFistHammer } from "./tier10/ItemDragonFistHammer";
import { itemGoldHammer } from "./tier11/ItemGoldHammer";
import { itemInfernoHammer } from "./tier12/itemInfernoHammer";
import { itemStarlightHammer } from "./tier12/itemStarlightHammer";
import { itemAvalancheHammer } from "./tier13/itemAvalancheHammer";
import { itemVoidhammer } from "./tier13/itemVoidhammer";
import { itemPhoenixFireHammer } from "./tier14/itemPhoenixFireHammer";
import { itemShadowHammer } from "./tier14/itemShadowHammer";
import { itemFrostSteelHammer } from "./tier15/itemFrostSteelHammer";
import { itemThunderForgedHammer } from "./tier15/itemThunderForgedHammer";
import { itemSilverHammer } from "./tier3/ItemSilverHammer";
import { itemWarHammer } from "./tier3/ItemWarHammer";
import { itemRoyalHammer } from "./tier4/ItemRoyalHammer";
import { itemSledgeHammer } from "./tier7/ItemSledgeHammer";
import { itemThorHammer } from "./tier8/ItemThorHammer";
import { itemMedievalCrossedHammer } from "./tier9/ItemMedievalCrossedHammer";

export const hammersBlueprintIndex = {
  [HammersBlueprint.IronHammer]: itemIronHammer,
  [HammersBlueprint.WarHammer]: itemWarHammer,
  [HammersBlueprint.SilverHammer]: itemSilverHammer,
  [HammersBlueprint.RoyalHammer]: itemRoyalHammer,
  [HammersBlueprint.MedievalCrossedHammer]: itemMedievalCrossedHammer,
  [HammersBlueprint.SledgeHammer]: itemSledgeHammer,
  [HammersBlueprint.ThorHammer]: itemThorHammer,
  [HammersBlueprint.GoldHammer]: itemGoldHammer,
  [HammersBlueprint.DragonFistHammer]: itemDragonFistHammer,
  [HammersBlueprint.ThunderForgedHammer]: itemThunderForgedHammer,
  [HammersBlueprint.FrostSteelHammer]: itemFrostSteelHammer,
  [HammersBlueprint.ShadowHammer]: itemShadowHammer,
  [HammersBlueprint.PhoenixFireHammer]: itemPhoenixFireHammer,
  [HammersBlueprint.AvalancheHammer]: itemAvalancheHammer,
  [HammersBlueprint.Voidhammer]: itemVoidhammer,
  [HammersBlueprint.StarlightHammer]: itemStarlightHammer,
  [HammersBlueprint.InfernoHammer]: itemInfernoHammer,
};
