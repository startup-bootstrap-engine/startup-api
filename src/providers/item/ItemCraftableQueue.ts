import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterItemContainer } from "@providers/character/characterItems/CharacterItemContainer";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { blueprintManager } from "@providers/inversify/container";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import {
  AnimationEffectKeys,
  CraftingSkill,
  ICraftItemPayload,
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  IUIShowMessage,
  ItemRarities,
  ItemSocketEvents,
  ItemType,
  UISocketEvents,
} from "@rpg-engine/shared";
import random from "lodash/random";
import shuffle from "lodash/shuffle";
import throttle from "lodash/throttle";

import {
  CRAFTING_BASE_CHANCE_IMPACT,
  CRAFTING_DIFFICULTY_RATIO,
  CRAFTING_ITEMS_CHANCE,
  CRAFTING_OUTPUT_QTY_RATIO,
  TOOLS_BASE_CHANCE_RATIO,
} from "@providers/constants/CraftingConstants";
import { TraitGetter } from "@providers/skill/TraitGetter";
import { AvailableBlueprints } from "./data/types/itemsBlueprintTypes";

import { CharacterPremiumAccount } from "@providers/character/CharacterPremiumAccount";
import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Locker } from "@providers/locks/Locker";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import _ from "lodash";
import { ItemCraftbookQueue } from "./ItemCraftbookQueue";
import { ItemCraftingRecipes } from "./ItemCraftingRecipes";

@provideSingleton(ItemCraftableQueue)
export class ItemCraftableQueue {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemContainer: CharacterItemContainer,
    private characterValidation: CharacterValidation,
    private characterItemInventory: CharacterItemInventory,
    private characterItemSlots: CharacterItemSlots,
    private characterWeight: CharacterWeightQueue,
    private animationEffect: AnimationEffect,
    private skillIncrease: SkillIncrease,
    private characterInventory: CharacterInventory,
    private inMemoryHashTable: InMemoryHashTable,
    private traitGetter: TraitGetter,
    private itemCraftingRecipes: ItemCraftingRecipes,
    private itemCraftbook: ItemCraftbookQueue,
    private characterPremiumAccount: CharacterPremiumAccount,
    private locker: Locker,
    private dynamicQueue: DynamicQueue
  ) {}

  public async craftItem(itemToCraft: ICraftItemPayload, character: ICharacter): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      await this.execCraftItem(itemToCraft, character);
      return;
    }

    await this.dynamicQueue.addJob(
      "craft-item",
      async (job) => {
        const { itemToCraft, character } = job.data;

        await this.execCraftItem(itemToCraft, character);
      },
      {
        itemToCraft,
        character,
      }
    );
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }

  public async shutdown(): Promise<void> {
    await this.dynamicQueue.shutdown();
  }

  @TrackNewRelicTransaction()
  public async execCraftItem(itemToCraft: ICraftItemPayload, character: ICharacter): Promise<void> {
    const canProceed = await this.locker.lock(`craft-item-${character._id}`);

    if (!canProceed) {
      return;
    }

    try {
      const hasBasicValidation = this.characterValidation.hasBasicValidation(character);

      if (!hasBasicValidation) {
        return;
      }

      if (!itemToCraft.itemKey) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "You must select at least one item to craft.");
        return;
      }

      if (!(character.skills as ISkill)?.level) {
        const skills = await Skill.findOne({ owner: character._id })
          .lean()
          .cacheQuery({
            cacheKey: `${character._id}-skills`,
          });

        if (!skills) {
          return;
        }

        character.skills = skills as ISkill;
      }

      const blueprint = blueprintManager.getBlueprint("items", itemToCraft.itemKey as AvailableBlueprints);
      const recipe = this.itemCraftingRecipes.getAllRecipes()[itemToCraft.itemKey];

      if (!blueprint || !recipe) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, this item can not be crafted.");
        return;
      }

      const inventoryInfoPromise = this.itemCraftingRecipes.getCharacterInventoryIngredients(character);
      const inventoryContainerPromise = this.characterInventory.getInventoryItemContainer(character);
      const qtyPromise = this.getQty(character, recipe);

      const [inventoryInfo, inventoryContainer, qty] = await Promise.all([
        inventoryInfoPromise,
        inventoryContainerPromise,
        qtyPromise,
      ]);

      if (!inventoryContainer) {
        this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you do not have an inventory.");
        return;
      }

      if (!this.itemCraftingRecipes.canCraftRecipe(inventoryInfo, recipe)) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, you do not have required items in your inventory."
        );
        return;
      }

      const itemToBeAdded = {
        ...blueprint,
        stackQty: qty,
      };

      const hasMinimumSkillsPromise = this.itemCraftingRecipes.haveMinimumSkills(character.skills as ISkill, recipe);
      const hasAvailableSlotsPromise = this.characterItemSlots.hasAvailableSlot(
        inventoryContainer._id,
        itemToBeAdded as IItem,
        true
      );

      const [hasMinimumSkills, hasAvailableSlots] = await Promise.all([
        hasMinimumSkillsPromise,
        hasAvailableSlotsPromise,
      ]);

      if (!hasAvailableSlots) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, you do not have enough space in your inventory."
        );
        return;
      }

      if (!hasMinimumSkills) {
        this.socketMessaging.sendErrorMessageToCharacter(
          character,
          "Sorry, you do not have the required skills ot craft this item."
        );
        return;
      }

      await this.inMemoryHashTable.delete("load-craftable-items", character._id);

      await this.performCrafting(recipe, character, itemToCraft.itemSubType);
    } catch (error) {
      console.error(error);
    } finally {
      await this.locker.unlock(`craft-item-${character._id}`);
    }
  }

  /**
   * getCraftChance returns the chance for a successful craft based on a baseChance.
   * If the avg crafting skills are higher than the baseChance, then the isCraftSuccessful function
   * @param character
   * @param baseChance chance to use in case characters avg crafting skills < baseChance
   * @returns
   */
  @TrackNewRelicTransaction()
  public async getCraftChance(
    character: ICharacter,
    baseSkill: CraftingSkill,
    baseChance: number,
    rarityOfTool: string
  ): Promise<() => Promise<boolean>> {
    const skillLevel = await this.getSkillLevel(character, baseSkill);
    const rarityChance = this.getRarityPercent(rarityOfTool);

    // @ts-ignore
    return this.isCraftSuccessful.bind(null, skillLevel, (baseChance + rarityChance ?? 0) * TOOLS_BASE_CHANCE_RATIO);
  }

  @TrackNewRelicTransaction()
  private async performCrafting(
    recipe: IUseWithCraftingRecipe,
    character: ICharacter,
    itemSubType?: string
  ): Promise<void> {
    let proceed = true;

    for (const item of recipe.requiredItems) {
      const success = await this.characterItemInventory.decrementItemFromInventoryByKey(item.key, character, item.qty);
      if (!success) {
        proceed = false;
        break;
      }
    }

    if (proceed) {
      const skillName = recipe.minCraftingRequirements[0];

      const skillLevel = await this.getSkillLevel(character, skillName as CraftingSkill);
      proceed = this.isCraftSuccessful(skillLevel, CRAFTING_ITEMS_CHANCE);
    }

    if (proceed) {
      await this.createItems(recipe, character);
      // update crafting skills
      await this.skillIncrease.increaseCraftingSP(character, recipe.outputKey, true);

      this.socketMessaging.sendEventToUser<IUIShowMessage>(character.channelId!, UISocketEvents.ShowMessage, {
        message: "You successfully crafted the item!",
        type: "info",
      });

      await this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.SkillLevelUp);
    } else {
      const failureMessages = shuffle([
        "Sorry, you failed to craft the item.",
        "Hmm... you couldn't get it right. At least you tried!",
        "You almost got the item correctly, but failed.",
        "You failed to craft the item. You should try again!",
      ]);

      // await this.skillIncrease.increaseCraftingSP(character, recipe.outputKey, false);

      this.socketMessaging.sendErrorMessageToCharacter(character, failureMessages[0]);

      await this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.Miss);
    }

    await this.characterWeight.updateCharacterWeight(character);
    await this.sendRefreshItemsEvent(character, itemSubType);
  }

  @TrackNewRelicTransaction()
  private async sendRefreshItemsEvent(character: ICharacter, itemSubType?: string): Promise<void> {
    const inventoryContainer = await this.characterItemContainer.getInventoryItemContainer(character);

    await this.inMemoryHashTable.delete("container-all-items", inventoryContainer?._id.toString()!);

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: inventoryContainer as unknown as IItemContainer,
      openEquipmentSetOnUpdate: false,
      openInventoryOnUpdate: true,
    };

    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );

    const throttledLoadCraftableItems = throttle(
      (itemSubType, character) => this.itemCraftbook.loadCraftableItems(itemSubType, character),
      1000
    );

    if (itemSubType) {
      void throttledLoadCraftableItems(itemSubType, character);
    }
  }

  @TrackNewRelicTransaction()
  private async createItems(recipe: IUseWithCraftingRecipe, character: ICharacter): Promise<void> {
    const blueprint = await blueprintManager.getBlueprint<IItem>("items", recipe.outputKey as AvailableBlueprints);
    let qty = await this.getQty(character, recipe);

    do {
      const props: Partial<IItem> = {
        owner: character._id,
        isItemContainer: blueprint.type === ItemType.Container,
      };

      if (blueprint.maxStackSize > 1) {
        let stackQty = 0;

        if (blueprint.maxStackSize < qty) {
          qty = qty - blueprint.maxStackSize;
          stackQty = blueprint.maxStackSize;
        } else {
          stackQty = qty;
          qty = 0;
        }

        props.stackQty = stackQty;
      } else {
        qty--;
      }

      await this.characterItemInventory.addItemToInventory(recipe.outputKey, character, props);
    } while (qty > 0);
  }

  private async getQty(character: ICharacter, recipe: IUseWithCraftingRecipe): Promise<number> {
    let baseQty = _.random(recipe.outputQtyRange[0], recipe.outputQtyRange[1]);

    const isSingleQtyItem = recipe.outputQtyRange[0] === recipe.outputQtyRange[1] && recipe.outputQtyRange[0] === 1;

    if (!isSingleQtyItem) {
      baseQty = baseQty * CRAFTING_OUTPUT_QTY_RATIO;

      const premiumAccountData = await this.characterPremiumAccount.getPremiumAccountData(character);

      if (premiumAccountData) {
        baseQty = baseQty * (1 + premiumAccountData.craftingQtyBuff / 100);
      }
    }
    return Math.ceil(baseQty);
  }

  /*
    Higher CRAFTING_DIFFICULTY_RATIO: Less impact of skillsAverage on successChance, making crafting more difficult.
    Lower CRAFTING_DIFFICULTY_RATIO: Greater impact of skillsAverage on successChance, making crafting easier.
  */

  private isCraftSuccessful(skillLevel: number, baseChance: number): boolean {
    baseChance = baseChance * CRAFTING_BASE_CHANCE_IMPACT;

    // Quadratic formula for impact
    const quadraticImpact = Math.pow(skillLevel, 0.7) / CRAFTING_DIFFICULTY_RATIO;

    const adjustedBaseChance = baseChance + quadraticImpact;

    // Cap successChance at 100
    const successChance = Math.min(100, adjustedBaseChance);

    const roll = random(0, 100);

    return roll <= successChance;
  }

  private async getSkillLevel(character: ICharacter, skillName: CraftingSkill): Promise<number> {
    const skills = (await Skill.findOne({ owner: character._id })
      .lean()
      .cacheQuery({
        cacheKey: `${character._id}-skills`,
      })) as ISkill;

    if (!skills) {
      return 0;
    }

    const skillLevel = (await this.traitGetter.getSkillLevelWithBuffs(skills, skillName)) ?? skills[skillName].level;

    return skillLevel;
  }

  private getRarityPercent(itemRarity: string): number {
    switch (itemRarity) {
      case ItemRarities.Common: {
        return 0;
      }
      case ItemRarities.Uncommon: {
        return 5;
      }

      case ItemRarities.Rare: {
        return 1;
      }
      case ItemRarities.Epic: {
        return 15;
      }
      case ItemRarities.Legendary: {
        return 25;
      }
      default: {
        return 0;
      }
    }
  }
}
