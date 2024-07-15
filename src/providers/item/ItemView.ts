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
  public async removeItemFromMap(item: IItem): Promise<boolean> {
    try {
      if (item.x === undefined || item.y === undefined || item.scene === undefined) {
        return false;
      }

      await this.warnCharactersAboutItemRemovalInView(item, item.x, item.y, item.scene);

      // unset x, y, and scene from item model
      await this.itemCoordinates.removeItemCoordinates(item);

      return true;
    } catch (error) {
      console.error("Error removing item from map:", error);
      return false;
    }
  }

  @TrackNewRelicTransaction()
  public async addItemToMap(item: IItem, x: number, y: number, scene: string): Promise<void> {
    if (x === undefined || y === undefined || scene === undefined) {
      throw new Error("You cannot call this method without an item x, y and scene.");
    }

    await Item.updateOne(
      {
        _id: item._id,
      },
      {
        x,
        y,
        scene,
      }
    );
  }

  @TrackNewRelicTransaction()
  public async warnCharactersAboutItemRemovalInView(item: IItem, x: number, y: number, scene: string): Promise<void> {
    if (x !== undefined && y !== undefined && scene !== undefined) {
      const charactersNearby = await this.characterView.getCharactersAroundXYPosition(x, y, scene);

      for (const character of charactersNearby) {
        this.socketMessaging.sendEventToUser<IViewDestroyElementPayload>(
          character.channelId!,
          ViewSocketEvents.Destroy,
          {
            id: item._id,
            type: "items",
          }
        );

        await this.characterView.removeFromCharacterView(character._id, item._id, "items");
      }
    } else {
      throw new Error("You cannot call this method without x, y and scene");
    }
  }

  @TrackNewRelicTransaction()
  public async warnCharacterAboutItemsInView(character: ICharacter, options?: IWarnOptions): Promise<void> {
    const itemsNearby = await this.getItemsInCharacterView(character);

    const itemsOnCharView = await this.characterView.getAllElementsOnView(character, "items");

    const itemsToUpdate: IItemUpdate[] = [];
    const viewElementsToAdd: IViewElement[] = [];

    for (let i = 0; i < itemsNearby.length; i++) {
      const item = itemsNearby[i];
      // eslint-disable-next-line mongoose-lean/require-lean
      const itemOnCharView = itemsOnCharView?.find((el) => el.id === item._id);

      const shouldSkip =
        !options?.always &&
        itemOnCharView &&
        this.objectHelper.doesObjectAttrMatches(itemOnCharView, item, ["id", "x", "y", "scene", "isDeadBodyLootable"]);

      const isInvalidItem = item.x === undefined || item.y === undefined || !item.scene || !item.layer || !item.name;

      if (shouldSkip || isInvalidItem) {
        continue;
      }

      itemsToUpdate.push(this.prepareItemToUpdate(item));

      viewElementsToAdd.push(this.prepareAddToView(item));
    }

    await this.characterView.batchAddToCharacterView(character._id, viewElementsToAdd, "items");

    if (itemsToUpdate.length > 0) {
      this.socketMessaging.sendEventToUser<IItemUpdateAll>(character.channelId!, ItemSocketEvents.UpdateAll, {
        items: itemsToUpdate,
      });
    }

    await this.characterView.clearAllOutOfViewElements(character._id, character.x, character.y);
  }

  private prepareItemToUpdate(item: IItem): IItemUpdate {
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
      stackQty: item.stackQty || 0,
      isDeadBodyLootable: item.isDeadBodyLootable,
      lastWatering: item.lastWatering!,
      isTileTinted: item.isTileTinted,
      growthPoints: item.growthPoints,
      requiredGrowthPoints: item.requiredGrowthPoints,
      isDead: item.isDead,
    };
  }

  private prepareAddToView(item: IItem): IViewElement {
    return {
      id: item._id,
      x: item.x!,
      y: item.y!,
      scene: item.scene!,
      isDeadBodyLootable: item.isDeadBodyLootable,
    };
  }

  @TrackNewRelicTransaction()
  public async getItemsInCharacterView(character: ICharacter): Promise<IItem[]> {
    const itemsInView = await this.characterView.getElementsInCharView(Item, character);

    return itemsInView;
  }
}
