import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { appEnv } from "@providers/config/env";
import { PROMISE_DEFAULT_CONCURRENCY } from "@providers/constants/ServerConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { blueprintManager } from "@providers/inversify/container";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { IUseWithCraftingRecipe, IUseWithCraftingRecipeItem } from "@providers/useWith/useWithTypes";
import { ICraftableItem, ICraftableItemIngredient, IItem, ItemSocketEvents } from "@rpg-engine/shared";
import { Promise } from "bluebird";
import { provide } from "inversify-binding-decorators";
import { ItemCraftingRecipes } from "./ItemCraftingRecipes";
import { AvailableBlueprints } from "./data/types/itemsBlueprintTypes";

@provide(ItemCraftbookQueue)
export class ItemCraftbookQueue {
  constructor(
    private inMemoryHashTable: InMemoryHashTable,
    private socketMessaging: SocketMessaging,
    private itemCraftingRecipes: ItemCraftingRecipes,
    private dynamicQueue: DynamicQueue
  ) {}

  @TrackNewRelicTransaction()
  public async loadCraftableItems(itemSubType: string, character: ICharacter): Promise<void> {
    if (appEnv.general.IS_UNIT_TEST) {
      return await this.execLoadCraftableItems(itemSubType, character);
    }

    await this.dynamicQueue.addJob(
      "load-craftable-items",
      async (job) => {
        const { itemSubType, character } = job.data;

        await this.execLoadCraftableItems(itemSubType, character);
      },
      { itemSubType, character }
    );
  }

  public async execLoadCraftableItems(itemSubType: string, character: ICharacter): Promise<void> {
    const cache = await this.inMemoryHashTable.get("load-craftable-items", character._id);

    const itemSubTypeCache = cache?.[itemSubType];

    if (itemSubTypeCache) {
      this.socketMessaging.sendEventToUser(character.channelId!, ItemSocketEvents.CraftableItems, itemSubTypeCache);
      return;
    }

    // Retrieve character inventory items
    const inventoryIngredients = await this.itemCraftingRecipes.getCharacterInventoryIngredients(character);

    const skills = (await Skill.findOne({ owner: character._id })
      .lean()
      .cacheQuery({
        cacheKey: `${character._id}-skills`,
      })) as ISkill;

    // Retrieve the list of recipes for the given item sub-type
    const recipes =
      itemSubType === "Suggested"
        ? await this.getRecipesWithAnyIngredientInInventory(character, inventoryIngredients)
        : await this.getRecipes(itemSubType);

    // Process each recipe to generate craftable items
    const craftableItems = (
      (await Promise.map(recipes, (recipe) => this.getCraftableItem(inventoryIngredients, recipe, skills), {
        concurrency: PROMISE_DEFAULT_CONCURRENCY,
      })) as ICraftableItem[]
    ).sort((a, b) => {
      // this what is craftable should be first
      if (a.canCraft && !b.canCraft) return -1;
      if (!a.canCraft && b.canCraft) return 1;
      return 0;
    });

    const currentCache = await this.inMemoryHashTable.get("load-craftable-items", character._id);

    await this.inMemoryHashTable.set("load-craftable-items", character._id, {
      ...currentCache,
      [itemSubType]: craftableItems,
    });

    // Send the list of craftable items to the user through a socket event
    this.socketMessaging.sendEventToUser(character.channelId!, ItemSocketEvents.CraftableItems, craftableItems);
  }

  @TrackNewRelicTransaction()
  private async getRecipes(subType: string): Promise<IUseWithCraftingRecipe[]> {
    const hasCache: IUseWithCraftingRecipe[] = (await this.inMemoryHashTable.get(
      "crafting-recipes",
      subType
    )) as IUseWithCraftingRecipe[];

    if (hasCache) {
      return hasCache;
    }

    const recipes = this.itemCraftingRecipes.getAllRecipes();
    const itemKeys = await blueprintManager.getAllBlueprintKeys("items");

    // Use Bluebird's Promise.map for concurrent blueprint fetching
    const availableRecipes: IUseWithCraftingRecipe[] = await Promise.map(
      itemKeys,
      async (itemKey) => {
        const item = await blueprintManager.getBlueprint<IItem>("items", itemKey as AvailableBlueprints);
        if (item.subType === subType && recipes[item.key]) {
          return recipes[item.key];
        }
        return null;
      },
      { concurrency: PROMISE_DEFAULT_CONCURRENCY }
    );

    // Filter out null values and sort
    const result = availableRecipes
      .filter(Boolean)
      .sort((a, b) => a.minCraftingRequirements[1] - b.minCraftingRequirements[1]);

    await this.inMemoryHashTable.set("crafting-recipes", subType, result);

    return result;
  }

  @TrackNewRelicTransaction()
  private async getRecipesWithAnyIngredientInInventory(
    character: ICharacter,
    inventoryIngredients: Map<string, number>
  ): Promise<IUseWithCraftingRecipe[]> {
    const recipes = this.itemCraftingRecipes.getAllRecipes();

    const itemKeys = await blueprintManager.getAllBlueprintKeys("items");

    const items = await Promise.map(
      itemKeys,
      (itemKey) => blueprintManager.getBlueprint<IItem>("items", itemKey as AvailableBlueprints),
      { concurrency: PROMISE_DEFAULT_CONCURRENCY }
    );

    const availableRecipes = items.reduce((acc, item) => {
      const recipe = recipes[item.key];
      if (recipe && recipe.requiredItems.some((ing) => (inventoryIngredients.get(ing.key) ?? 0) > 0)) {
        acc.push(recipe);
      }
      return acc;
    }, [] as IUseWithCraftingRecipe[]);

    const quantities = availableRecipes.map((recipe) =>
      recipe.requiredItems.reduce((acc, ing) => acc + (inventoryIngredients.get(ing.key) ?? 0), 0)
    );

    const metRequirements = availableRecipes.map((recipe) =>
      recipe.requiredItems.reduce((acc, ing) => acc + ((inventoryIngredients.get(ing.key) ?? 0) >= ing.qty ? 1 : 0), 0)
    );

    return availableRecipes.sort((a, b) => {
      const aQty = quantities[availableRecipes.indexOf(a)];
      const bQty = quantities[availableRecipes.indexOf(b)];
      const aMet = metRequirements[availableRecipes.indexOf(a)];
      const bMet = metRequirements[availableRecipes.indexOf(b)];

      if (aMet > bMet) {
        return -1;
      }

      if (aMet < bMet) {
        return 1;
      }

      if (aQty > bQty) {
        return -1;
      }

      if (aQty < bQty) {
        return 1;
      }

      return a.minCraftingRequirements[1] - b.minCraftingRequirements[1];
    });
  }

  @TrackNewRelicTransaction()
  private async getCraftableItem(
    inventoryInfo: Map<string, number>,
    recipe: IUseWithCraftingRecipe,
    skills: ISkill
  ): Promise<ICraftableItem> {
    const [item, ingredients] = await Promise.all([
      blueprintManager.getBlueprint<IItem>("items", recipe.outputKey as AvailableBlueprints),
      this.getCraftableItemIngredients(recipe.requiredItems),
    ]);

    const minCraftingRequirements = recipe.minCraftingRequirements;
    const haveMinimumSkills = this.itemCraftingRecipes.haveMinimumSkills(skills, recipe);
    const canCraft = this.itemCraftingRecipes.canCraftRecipe(inventoryInfo, recipe) && haveMinimumSkills;

    return {
      ...item,
      canCraft,
      ingredients: ingredients,
      minCraftingRequirements,
      levelIsOk: haveMinimumSkills,
    };
  }

  @TrackNewRelicTransaction()
  private async getCraftableItemIngredients(items: IUseWithCraftingRecipeItem[]): Promise<ICraftableItemIngredient[]> {
    const uniqueKey = this.generateUniqueHash(items);
    const cachedIngredients = (await this.inMemoryHashTable.get(
      "craftable-item-ingredients",
      uniqueKey
    )) as ICraftableItemIngredient[];

    if (cachedIngredients) {
      return cachedIngredients;
    }

    const ingredients = await Promise.map(
      items,
      async (item) => {
        const blueprint = await blueprintManager.getBlueprint<IItem>("items", item.key as AvailableBlueprints);
        return {
          key: item.key,
          qty: item.qty,
          name: blueprint ? blueprint.name : "",
          texturePath: blueprint ? blueprint.texturePath : "",
        };
      },
      { concurrency: PROMISE_DEFAULT_CONCURRENCY }
    );

    await this.inMemoryHashTable.set("craftable-item-ingredients", uniqueKey, ingredients);

    return ingredients;
  }

  private generateUniqueHash(items: IUseWithCraftingRecipeItem[]): string {
    return items.map((item) => `${item.key}-${item.qty}`).join(";");
  }

  public async clearAllJobs(): Promise<void> {
    await this.dynamicQueue.clearAllJobs();
  }
}
