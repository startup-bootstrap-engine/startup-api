import { ArmorsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { recipeBloodfireArmor } from "./tier5/recipeBloodfireArmor";
import { recipeBlueCape } from "./tier1/recipeBlueCape";
import { recipeBrassArmor } from "./tier2/recipeBrassArmor";
import { recipeBronzeArmor } from "./tier2/recipeBronzeArmor";
import { recipeCoat } from "./tier0/recipeCoat";
import { recipeCrownArmor } from "./tier4/recipeCrownArmor";
import { recipeEtherealGuardianMail } from "./tier9/recipeEtherealGuardianMail";
import { recipeFalconsArmor } from "./tier4/recipeFalconsArmor";
import { recipeFarmersJacket } from "./tier0/recipeFarmersJacket";
import { recipeGlacialArmor } from "./tier3/recipeGlacialArmor";
import { recipeIronArmor } from "./tier1/recipeIronArmor";
import { recipeIroncladArmor } from "./tier2/recipeIroncladArmor";
import { recipeJacket } from "./tier0/recipeJacket";
import { recipeKnightArmor } from "./tier3/recipeKnightArmor";
import { recipeLeatherJacket } from "./tier0/recipeLeatherJacket";
import { recipeMysticCape } from "./tier2/recipeMysticCape";
import { recipePlateArmor } from "./tier4/recipePlateArmor";
import { recipeSamuraiArmor } from "./tier6/recipeSamuraiArmor";
import { recipeSorcerersCape } from "./tier3/recipeSorcerersCape";
import { recipeSpellcastersCape } from "./tier4/recipeSpellCastersCape";
import { recipeStuddedArmor } from "./tier1/recipeStuddedArmor";

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
