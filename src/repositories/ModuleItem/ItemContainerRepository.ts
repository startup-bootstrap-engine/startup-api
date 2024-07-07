import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { AnalyticsHelper } from "@providers/analytics/AnalyticsHelper";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { CRUD } from "@providers/mongoDB/MongoCRUDGeneric";
import { provide } from "inversify-binding-decorators";

@provide(ItemContainerRepository)
export class ItemContainerRepository extends CRUD {
  constructor(private analyticsHelper: AnalyticsHelper) {
    super(analyticsHelper);
  }

  @TrackNewRelicTransaction()
  public async createItemContainer(
    parentItem: IItem,
    itemContainerProps: Partial<IItemContainer>
  ): Promise<IItemContainer> {
    const newItemContainer = new ItemContainer({
      ...itemContainerProps,
    });

    const slotsQty = newItemContainer.slotQty;

    console.log("creating item container with slotsQty: ", slotsQty);

    const slots = {};

    for (let i = 0; i < slotsQty; i++) {
      slots[Number(i)] = null;
    }
    newItemContainer.slots = slots;
    // @ts-ignore
    newItemContainer.parentItem.id;
    // eslint-disable-next-line mongoose-lean/require-lean
    await newItemContainer.save();

    parentItem.isItemContainer = true;
    parentItem.itemContainer = newItemContainer._id;
    // eslint-disable-next-line mongoose-lean/require-lean
    await parentItem.save();

    return newItemContainer;
  }
}
