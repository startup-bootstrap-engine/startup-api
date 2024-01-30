import { IEquippableMeleeTier11WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType } from "@rpg-engine/shared";
import { AxesBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemMinecraftAxe: IEquippableMeleeTier11WeaponBlueprint = {
  key: AxesBlueprint.MinecraftAxe,
  type: ItemType.Weapon,
  subType: ItemSubType.Axe,
  textureAtlas: "items",
  texturePath: "axes/minecraft-axes.png",
  name: "Minecraft Axe",
  description:
    "Minecraft axe provides a captivating and immersive experience within its pixelated realms, drawing players into a harmonious world where creativity and exploration know no bounds.",
  weight: 3.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  attack: 85,
  defense: 84,
  tier: 11,
  rangeType: EntityAttackType.Melee,
  basePrice: 107,
};
