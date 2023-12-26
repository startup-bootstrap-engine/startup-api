import { ArmorsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeBloodfireArmor } from "./recipeBloodfireArmor";
import { recipeBlueCape } from "./recipeBlueCape";
import { recipeBrassArmor } from "./recipeBrassArmor";
import { recipeBronzeArmor } from "./recipeBronzeArmor";
import { recipeCoat } from "./recipeCoat";
import { recipeCrownArmor } from "./recipeCrownArmor";
import { recipeEtherealGuardianMail } from "./recipeEtherealGuardianMail";
import { recipeFalconsArmor } from "./recipeFalconsArmor";
import { recipeFarmersJacket } from "./recipeFarmersJacket";
import { recipeGlacialArmor } from "./recipeGlacialArmor";
import { recipeIronArmor } from "./recipeIronArmor";
import { recipeIroncladArmor } from "./recipeIroncladArmor";
import { recipeJacket } from "./recipeJacket";
import { recipeKnightArmor } from "./recipeKnightArmor";
import { recipeLeatherJacket } from "./recipeLeatherJacket";
import { recipeMysticCape } from "./recipeMysticCape";
import { recipePlateArmor } from "./recipePlateArmor";
import { recipeSamuraiArmor } from "./recipeSamuraiArmor";
import { recipeSorcerersCape } from "./recipeSorcerersCape";
import { recipeSpellcastersCape } from "./recipeSpellCastersCape";
import { recipeStuddedArmor } from "./recipeStuddedArmor";

export const recipeArmorsIndex: Record<string, IUseWithCraftingRecipe[]> = {
  [ArmorsBlueprint.StuddedArmor]: [recipeStuddedArmor],
  [ArmorsBlueprint.IronArmor]: [recipeIronArmor],
  [ArmorsBlueprint.BronzeArmor]: [recipeBronzeArmor],
  [ArmorsBlueprint.PlateArmor]: [recipePlateArmor],
  [ArmorsBlueprint.BloodfireArmor]: [recipeBloodfireArmor],
  [ArmorsBlueprint.BlueCape]: [recipeBlueCape],
  [ArmorsBlueprint.BrassArmor]: [recipeBrassArmor],
  [ArmorsBlueprint.CrownArmor]: [recipeCrownArmor],
  [ArmorsBlueprint.FalconsArmor]: [recipeFalconsArmor],
  [ArmorsBlueprint.GlacialArmor]: [recipeGlacialArmor],
  [ArmorsBlueprint.IroncladArmor]: [recipeIroncladArmor],
  [ArmorsBlueprint.KnightArmor]: [recipeKnightArmor],
  [ArmorsBlueprint.MysticCape]: [recipeMysticCape],
  [ArmorsBlueprint.SorcerersCape]: [recipeSorcerersCape],
  [ArmorsBlueprint.SpellcastersCape]: [recipeSpellcastersCape],
  [ArmorsBlueprint.Coat]: [recipeCoat],
  [ArmorsBlueprint.Jacket]: [recipeJacket],
  [ArmorsBlueprint.FarmersJacket]: [recipeFarmersJacket],
  [ArmorsBlueprint.LeatherJacket]: [recipeLeatherJacket],
  [ArmorsBlueprint.SamuraiArmor]: [recipeSamuraiArmor],
  [ArmorsBlueprint.EtherealGuardianMail]: [recipeEtherealGuardianMail],
};
