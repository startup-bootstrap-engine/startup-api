import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { IItemGem } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

interface IGemAttachGemStatsCalculation {
  totalAttack: number;
  totalDefense: number;
  entityEffects: Set<string>;
  entityEffectChance: number;
  gemNames: Set<string>;
}

@provide(GemAttachDescriptionUpdater)
export class GemAttachDescriptionUpdater {
  public async updateTargetEquippedBuffDescription(
    targetItem: IItem,
    gemItemBlueprint: IItemGem,
    isArmorOrShield: boolean
  ): Promise<void> {
    const currentItem = await this.getCurrentItem(targetItem);
    const attachedGems = (currentItem.attachedGems as unknown as IItemGem[]) || [];

    const baseDescription = this.getBaseDescription(currentItem);
    const gemDescription = this.getGemDescription(attachedGems, gemItemBlueprint, isArmorOrShield); // Pass gemItemBlueprint here
    const additionalBuffs = this.getAdditionalBuffs(gemItemBlueprint);

    const updatedDescription = this.combineDescriptions(baseDescription, gemDescription, additionalBuffs);

    await this.updateItemDescription(targetItem, updatedDescription, attachedGems);
  }

  private async getCurrentItem(targetItem: IItem): Promise<IItem> {
    const currentItem = await Item.findById(targetItem._id).lean<
      IItem & {
        attachedGems: IItemGem[];
      }
    >();
    if (!currentItem) {
      throw new Error(`Item with ID ${targetItem._id} not found`);
    }
    return currentItem;
  }

  private getBaseDescription(currentItem: IItem): string {
    const existingDescription = currentItem.equippedBuffDescription || "";

    // Check if there's an existing description
    if (!existingDescription) {
      return "";
    }

    const baseDescription = existingDescription.split(/Gems?:/)[0].trim();
    return baseDescription ? `Base: ${baseDescription}` : "";
  }

  private getGemDescription(attachedGems: IItemGem[], gemItemBlueprint: IItemGem, isArmorOrShield: boolean): string {
    // Use gemItemBlueprint if no attached gems
    const { totalAttack, totalDefense, entityEffects, entityEffectChance, gemNames } = this.calculateGemStats(
      attachedGems.length > 0 ? attachedGems : [gemItemBlueprint], // Fallback to gemItemBlueprint
      isArmorOrShield
    );

    let gemDescription = this.formatGemNames(gemNames);
    gemDescription += this.formatGemStats(totalAttack, totalDefense, isArmorOrShield);
    gemDescription += this.formatEntityEffects(entityEffects, entityEffectChance);

    return gemDescription.trim();
  }

  private calculateGemStats(attachedGems: IItemGem[], isArmorOrShield: boolean): IGemAttachGemStatsCalculation {
    let totalAttack = 0;
    let totalDefense = 0;
    const entityEffects: Set<string> = new Set();
    let entityEffectChance = 0;
    const gemNames: Set<string> = new Set();

    for (const gem of attachedGems) {
      totalAttack += gem.gemStatBuff?.attack || 0;
      totalDefense += gem.gemStatBuff?.defense || 0;

      if (!isArmorOrShield) {
        if (gem.gemEntityEffectsAdd) {
          gem.gemEntityEffectsAdd.forEach((effect) => entityEffects.add(effect));
        }
        entityEffectChance = Math.max(entityEffectChance, gem.gemEntityEffectChance || 0);
      }

      gemNames.add(gem.name?.replace(" Gem", "") || "");
    }

    return { totalAttack, totalDefense, entityEffects, entityEffectChance, gemNames };
  }

  private formatGemNames(gemNames: Set<string>): string {
    const gemNamesArray = Array.from(gemNames);
    return gemNamesArray.length === 1 ? `${gemNamesArray[0]} Gem: ` : `${gemNamesArray.join(", ")} Gems: `;
  }

  private formatGemStats(totalAttack: number, totalDefense: number, isArmorOrShield: boolean): string {
    return isArmorOrShield ? `+${totalDefense} def` : `+${totalAttack} atk, +${totalDefense} def`;
  }

  private formatEntityEffects(entityEffects: Set<string>, entityEffectChance: number): string {
    return entityEffects.size > 0
      ? `, ${entityEffectChance}% chance of applying ${Array.from(entityEffects).join(", ")} effects`
      : "";
  }

  private getAdditionalBuffs(gemItemBlueprint: IItemGem): string {
    if (!gemItemBlueprint.gemEquippedBuffAdd) return "";

    const formatTrait = (trait: string): string => {
      return trait
        .split(/(?=[A-Z])/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const buffs = Array.isArray(gemItemBlueprint.gemEquippedBuffAdd)
      ? gemItemBlueprint.gemEquippedBuffAdd
          .map((buff) => `${formatTrait(buff.trait)}: +${buff.buffPercentage}%`)
          .join(", ")
      : `${formatTrait(gemItemBlueprint.gemEquippedBuffAdd.trait)}: +${
          gemItemBlueprint.gemEquippedBuffAdd.buffPercentage
        }%`;

    return `Additional buffs: ${buffs}`;
  }

  private combineDescriptions(baseDescription: string, gemDescription: string, additionalBuffs: string): string {
    let updatedDescription = baseDescription || ""; // Ensure it's not null
    if (gemDescription) {
      updatedDescription += (updatedDescription ? ". " : "") + gemDescription;
    }
    if (additionalBuffs) {
      updatedDescription += (updatedDescription ? ". " : "") + additionalBuffs;
    }

    // If no base or gem description, use default description for gems
    if (!updatedDescription) {
      updatedDescription = gemDescription || "Gems: No buffs applied";
    }

    return updatedDescription;
  }

  private async updateItemDescription(
    targetItem: IItem,
    updatedDescription: string,
    attachedGems: IItemGem[]
  ): Promise<void> {
    const entityEffects = new Set<string>();
    let entityEffectChance = 0;

    for (const gem of attachedGems) {
      if (gem.gemEntityEffectsAdd) {
        gem.gemEntityEffectsAdd.forEach((effect) => entityEffects.add(effect));
      }
      entityEffectChance = Math.max(entityEffectChance, gem.gemEntityEffectChance || 0);
    }

    await Item.findByIdAndUpdate(targetItem._id, {
      $set: {
        equippedBuffDescription: updatedDescription.trim(),
        entityEffects: Array.from(entityEffects),
        entityEffectChance: entityEffectChance,
      },
    });
  }
}
