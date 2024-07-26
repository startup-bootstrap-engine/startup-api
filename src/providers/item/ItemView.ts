import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CharacterView } from "@providers/character/CharacterView";
import { DataStructureHelper } from "@providers/dataStructures/DataStructuresHelper";
import { IWarnOptions } from "@providers/npc/NPCWarn";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  IItemUpdate,
  IItemUpdateAll,
  IViewDestroyElementPayload,
  IViewElement,
  ItemSocketEvents,
  ItemSubType,
  ItemType,
  ViewSocketEvents,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { ItemCoordinates } from "./ItemCoordinates";
@provide(ItemView)
export class ItemView {
  constructor(
    private characterView: CharacterView,
    private socketMessaging: SocketMessaging,
    private objectHelper: DataStructureHelper,
    private itemCoordinates: ItemCoordinates
  ) {}

  @TrackNewRelicTransaction()
  public async warnCharactersAboutItemRemovalInView(item: IItem): Promise<boolean> {
    if (!this.isValidItemLocation(item)) {
      return false;
    }

    try {
      await this.notifyCharactersAboutItemRemoval(item);
      await this.itemCoordinates.removeItemCoordinates(item);
      return true;
    } catch (error) {
      console.error("Error removing item from map:", error);
      return false;
    }
  }

  @TrackNewRelicTransaction()
  public async addItemToMap(item: IItem, x: number, y: number, scene: string): Promise<void> {
    this.validateItemLocation(x, y, scene);
    await Item.updateOne({ _id: item._id }, { x, y, scene });
  }

  @TrackNewRelicTransaction()
  public async notifyCharactersAboutItemRemoval(item: IItem): Promise<void> {
    const { x, y, scene } = item;
    this.validateItemLocation(x, y, scene);

    const charactersNearby = await this.characterView.getCharactersAroundXYPosition(x!, y!, scene!);

    for (const character of charactersNearby) {
      await this.notifyCharacterAboutItemRemoval(character, item);
    }
  }

  @TrackNewRelicTransaction()
  public async warnCharacterAboutItemsInView(character: ICharacter, options?: IWarnOptions): Promise<void> {
    const itemsNearby = await this.getItemsInCharacterView(character);
    const itemsOnCharView = (await this.characterView.getAllElementsOnView(character, "items")) ?? [];

    const { itemsToUpdate, viewElementsToAdd } = this.prepareItemUpdates(itemsNearby, itemsOnCharView, options);

    await this.updateCharacterView(character, itemsToUpdate, viewElementsToAdd);
    await this.characterView.clearAllOutOfViewElements(character._id, character.x, character.y);
  }

  @TrackNewRelicTransaction()
  public async getItemsInCharacterView(character: ICharacter): Promise<IItem[]> {
    return await this.characterView.getElementsInCharView(Item, character);
  }

  private isValidItemLocation(item: IItem): boolean {
    return item.x !== undefined && item.y !== undefined && item.scene !== undefined;
  }

  private validateItemLocation(x?: number, y?: number, scene?: string): void {
    if (x === undefined || y === undefined || scene === undefined) {
      throw new Error("Invalid item location: x, y, and scene are required.");
    }
  }

  private async notifyCharacterAboutItemRemoval(character: ICharacter, item: IItem): Promise<void> {
    this.socketMessaging.sendEventToUser<IViewDestroyElementPayload>(character.channelId!, ViewSocketEvents.Destroy, {
      id: item._id,
      type: "items",
    });

    await this.characterView.removeFromCharacterView(character._id, item._id, "items");
  }

  private prepareItemUpdates(
    itemsNearby: IItem[],
    itemsOnCharView: IViewElement[],
    options?: IWarnOptions
  ): { itemsToUpdate: IItemUpdate[]; viewElementsToAdd: IViewElement[] } {
    const itemsToUpdate: IItemUpdate[] = [];
    const viewElementsToAdd: IViewElement[] = [];

    for (const item of itemsNearby) {
      if (this.shouldUpdateItem(item, itemsOnCharView, options)) {
        itemsToUpdate.push(this.createItemUpdate(item));
        viewElementsToAdd.push(this.createViewElement(item));
      }
    }

    return { itemsToUpdate, viewElementsToAdd };
  }

  private shouldUpdateItem(item: IItem, itemsOnCharView: IViewElement[], options?: IWarnOptions): boolean {
    // eslint-disable-next-line mongoose-lean/require-lean
    const isOnCharView = itemsOnCharView?.find((el) => el.id.toString() === item._id.toString());
    const hasSameRelevantInfo =
      isOnCharView &&
      this.objectHelper.doesObjectAttrMatches(isOnCharView, item, ["id", "x", "y", "scene", "isDeadBodyLootable"]);

    return !!(!hasSameRelevantInfo || options?.always) && this.isValidItemForUpdate(item);
  }

  private isValidItemForUpdate(item: IItem): boolean {
    return !!(item.x !== undefined && item.y !== undefined && item.scene && item.layer && item.name);
  }

  private createItemUpdate(item: IItem): IItemUpdate {
    return {
      id: item._id,
      texturePath: item.texturePath,
      textureAtlas: item.textureAtlas,
      type: item.type as ItemType,
      subType: item.subType as ItemSubType,
      name: item.name,
      x: item.x!,
      y: item.y!,
      layer: item.layer!,
      stackQty: item.stackQty ?? 0,
      isDeadBodyLootable: item.isDeadBodyLootable,
      lastWatering: item.lastWatering!,
      isTileTinted: item.isTileTinted,
      growthPoints: item.growthPoints,
      requiredGrowthPoints: item.requiredGrowthPoints,
      isDead: item.isDead,
    };
  }

  private createViewElement(item: IItem): IViewElement {
    return {
      id: item._id,
      x: item.x!,
      y: item.y!,
      scene: item.scene!,
      isDeadBodyLootable: item.isDeadBodyLootable,
    };
  }

  private async updateCharacterView(
    character: ICharacter,
    itemsToUpdate: IItemUpdate[],
    viewElementsToAdd: IViewElement[]
  ): Promise<void> {
    if (viewElementsToAdd.length > 0) {
      await this.characterView.batchAddToCharacterView(character._id, viewElementsToAdd, "items");
    }

    if (itemsToUpdate.length > 0) {
      this.socketMessaging.sendEventToUser<IItemUpdateAll>(character.channelId!, ItemSocketEvents.UpdateAll, {
        items: itemsToUpdate,
      });
    }
  }
}
