/* eslint-disable mongoose-lean/require-lean */
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { blueprintManager } from "@providers/inversify/container";
import { ICharacterPermanentBuff, IEquippableItemBlueprint, IItemGem } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(GemAttachDescriptionUpdater)
export class GemAttachDescriptionUpdater {
  public async updateTargetEquippedBuffDescription(
    targetItem: IItem,
    gemToBeAddedBlueprint: IItemGem,
    isArmorOrShield: boolean
  ): Promise<void> {
    const weaponBuffs = this.getWeaponBuffs(targetItem);
    const weaponStats = this.getWeaponStats(targetItem);
    const gemBuffs = this.getGemBuffs(targetItem, gemToBeAddedBlueprint);
    const gemStats = this.getTotalGemStats(targetItem, gemToBeAddedBlueprint, isArmorOrShield);
    const attachedGemNames = this.getAttachedGemNames(targetItem, gemToBeAddedBlueprint);
    const entityEffects = this.getEntityEffects(targetItem, gemToBeAddedBlueprint);
    const entityEffectsChance = this.getEntityEffectsChance(targetItem, gemToBeAddedBlueprint);

    // Combine the data into a readable format
    const readableOutput = this.buildReadableOutput(
      attachedGemNames,
      weaponBuffs,
      weaponStats,
      gemBuffs,
      gemStats,
      entityEffects,
      entityEffectsChance,
      isArmorOrShield
    );

    // console.log(`
    // REPORT:
    //   attachedGems: ${JSON.stringify(attachedGemNames)}
    //   weaponBuffs: ${JSON.stringify(weaponBuffs)}
    //   gemBuffs: ${JSON.stringify(gemBuffs)}
    //   entityEffects: ${JSON.stringify(entityEffects)}
    //   totalStats: ${JSON.stringify(totalStats)}
    //   Description: ${readableOutput}
    // `);

    await Item.updateOne(
      {
        _id: targetItem._id,
      },
      {
        $set: {
          equippedBuffDescription: readableOutput,
        },
      }
    );
  }

  private buildReadableOutput(
    attachedGemNames: string,
    weaponBuffs: ICharacterPermanentBuff[],
    weaponStats: { attack: number; defense: number },
    gemBuffs: ICharacterPermanentBuff[],
    gemStats: { attack: number; defense: number },
    entityEffects: string[],
    entityEffectsChance: number,
    isArmorOrShield: boolean
  ): string {
    // Total Stats: Combine weapon and gem stats
    const totalAttack = weaponStats.attack + gemStats.attack;
    const totalDefense = weaponStats.defense + gemStats.defense;

    // Buffs Description: Display the total value with breakdown (weapon + gems)
    const buffsDescription = this.mergeBuffs(weaponBuffs, gemBuffs)
      .map((buff) => {
        const fromWeapon = weaponBuffs?.find((wb) => wb.trait === buff.trait)?.buffPercentage || 0;
        const fromGem = gemBuffs?.find((gb) => gb.trait === buff.trait)?.buffPercentage || 0;

        let breakdownText = "";
        if (fromWeapon > 0 && fromGem > 0) {
          breakdownText = ` (${fromWeapon}+${fromGem})`;
        } else if (!fromGem || !fromWeapon) {
          breakdownText = "";
        }

        return `${this.capitalize(buff.trait)} +${buff.buffPercentage}%${fromWeapon > 0 ? breakdownText : ""}`;
      })
      .filter((buff) => buff !== "") // Remove empty strings for skipped buffs
      .join(", ");

    // Entity Effects Description
    const effectsDescription =
      entityEffects.length > 0
        ? `. Effects: ${entityEffects.map(this.formatDashCase).join(", ")} (${entityEffectsChance}%)`
        : "";

    // Final Output (Exclude 0 atk)
    const attackDescription =
      totalAttack > 0
        ? `${totalAttack} atk${
            weaponStats.attack > 0 && gemStats.attack > 0 ? ` (${weaponStats.attack}+${gemStats.attack})` : ""
          }`
        : "";

    const defenseDescription =
      totalDefense > 0
        ? `${totalDefense} def${
            weaponStats.defense > 0 && gemStats.defense > 0 ? ` (${weaponStats.defense}+${gemStats.defense})` : ""
          }`
        : "";

    const statsDescription = attackDescription ? `${attackDescription}, ${defenseDescription}` : defenseDescription;

    return `${attachedGemNames} Gem: ${statsDescription}. Buffs: ${buffsDescription}${
      isArmorOrShield ? "" : effectsDescription
    }.`;
  }

  private mergeBuffs(
    weaponBuffs: ICharacterPermanentBuff[],
    gemBuffs: ICharacterPermanentBuff[]
  ): { trait: string; buffPercentage: number }[] {
    const buffMap: { [trait: string]: { fromWeapon: number; fromGem: number } } = {};

    // Collect weapon buffs
    weaponBuffs?.forEach((buff) => {
      buffMap[buff.trait] = { fromWeapon: buff.buffPercentage, fromGem: 0 };
    });

    // Collect gem buffs and combine them with weapon buffs
    gemBuffs?.forEach((buff) => {
      if (buffMap[buff.trait]) {
        buffMap[buff.trait].fromGem = buff.buffPercentage;
      } else {
        buffMap[buff.trait] = { fromWeapon: 0, fromGem: buff.buffPercentage };
      }
    });

    // Convert the buffMap back to an array of buff objects
    return Object.entries(buffMap).map(([trait, { fromWeapon, fromGem }]) => ({
      trait,
      buffPercentage: fromWeapon + fromGem,
    }));
  }

  private getEntityEffectsChance(targetItem: IItem, gemItemBlueprint: IItemGem): number {
    const currentGems =
      targetItem.attachedGems?.map((gem) => {
        const gemBlueprint = blueprintManager.getBlueprint("items", gem.key!) as IItemGem;
        return gemBlueprint;
      }) || [];

    const allGems = [...currentGems, gemItemBlueprint];

    const maxEntityEffectsChance = allGems.reduce((maxChance, gem) => {
      return Math.max(maxChance, gem.gemEntityEffectChance || 0);
    }, 0);

    return maxEntityEffectsChance;
  }

  private capitalize(text: string): string {
    // Handle camelCase and concatenated words (e.g., MagicResistance -> Magic Resistance)
    const spacedText = text.replace(/([a-z])([A-Z])/g, "$1 $2");
    return spacedText.charAt(0).toUpperCase() + spacedText.slice(1).toLowerCase();
  }

  private formatDashCase(text: string): string {
    // Split dash-cased words and capitalize each word
    return text
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private getEntityEffects(targetItem: IItem, gemItemBlueprint: IItemGem): string[] {
    const currentGems =
      targetItem.attachedGems?.map((gem) => {
        const gemBlueprint = blueprintManager.getBlueprint("items", gem.key!) as IItemGem;
        return gemBlueprint;
      }) || [];

    const allGems = [...currentGems, gemItemBlueprint];

    const entityEffects = allGems.flatMap((gem) => gem.gemEntityEffectsAdd || []);

    return entityEffects;
  }

  private getAttachedGemNames(targetItem: IItem, gemToBeAddedBlueprint: IItemGem): string {
    const currentGems = targetItem.attachedGems || [];
    const allGems = [...currentGems, gemToBeAddedBlueprint];

    const gemNames = allGems.map((gem) => {
      const gemBlueprint = blueprintManager.getBlueprint("items", gem.key!) as IItemGem;
      return gemBlueprint.name.replace("Gem", "").trim();
    });

    return gemNames.join(", ");
  }

  private getWeaponStats(targetItem: IItem): { attack: number; defense: number } {
    const currentWeapon = blueprintManager.getBlueprint(
      "items",
      targetItem.baseKey || targetItem.key
    ) as IEquippableItemBlueprint;

    const baseAttack = currentWeapon?.attack || 0;
    const baseDefense = currentWeapon?.defense || 0;

    return {
      attack: baseAttack,
      defense: baseDefense,
    };
  }

  private getTotalGemStats(
    targetItem: IItem,
    gemItemBlueprint: IItemGem,
    isArmorOrShield: boolean
  ): { attack: number; defense: number } {
    let totalAttack = 0;
    let totalDefense = 0;

    const currentGems = targetItem.attachedGems || [];
    const allGems = [...currentGems, gemItemBlueprint];

    // Use a Set to avoid stacking the same gems
    const uniqueGems = new Set<string>();
    allGems.forEach((gem) => {
      if (!uniqueGems.has(gem.key!)) {
        uniqueGems.add(gem.key!);

        if (!isArmorOrShield) {
          totalAttack += gem.gemStatBuff?.attack || 0;
        }
        totalDefense += gem.gemStatBuff?.defense || 0;
      }
    });

    return {
      attack: totalAttack,
      defense: totalDefense,
    };
  }

  private getWeaponBuffs(targetItem: IItem): ICharacterPermanentBuff[] {
    const currentWeapon = blueprintManager.getBlueprint(
      "items",
      targetItem.baseKey || targetItem.key
    ) as IEquippableItemBlueprint;

    const weaponBuffs = currentWeapon?.equippedBuff;

    return weaponBuffs as ICharacterPermanentBuff[];
  }

  private getGemBuffs(targetItem: IItem, gemItemBlueprint: IItemGem): ICharacterPermanentBuff[] {
    const currentGems =
      targetItem.attachedGems?.map((gem) => {
        const gemBlueprint = blueprintManager.getBlueprint("items", gem.key!) as IItemGem;

        return gemBlueprint;
      }) || [];

    const allGems = [...currentGems, gemItemBlueprint];

    const gemBuffs = allGems.flatMap((gem) => gem.gemEquippedBuffAdd || []);

    return gemBuffs as ICharacterPermanentBuff[];
  }
}
