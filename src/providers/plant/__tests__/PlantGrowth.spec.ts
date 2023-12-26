import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { blueprintManager, container, unitTestHelper } from "@providers/inversify/container";
import { ItemType } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { PlantGrowth } from "../PlantGrowth";
import { IPlantItem } from "../data/blueprints/PlantItem";
import { PlantItemBlueprint, PlantLifeCycle } from "../data/types/PlantTypes";

describe("PlantGrowth.ts", () => {
  let plantGrowth: PlantGrowth;
  let plant: IItem;
  let blueprint: IPlantItem;
  let mockItemUpdateOne: jest.Mock;

  beforeAll(() => {
    plantGrowth = container.get<PlantGrowth>(PlantGrowth);

    mockItemUpdateOne = jest.fn();
    Item.updateOne = mockItemUpdateOne;
  });

  beforeEach(async () => {
    blueprint = (await blueprintManager.getBlueprint("plants", PlantItemBlueprint.Carrot)) as IPlantItem;
    plant = await unitTestHelper.createMockItem(blueprint);

    // @ts-ignore
    plant.lastWatering = dayjs().subtract(10, "minute").toISOString();
    // @ts-ignore
    plant.lastPlantCycleRun = dayjs().subtract(20, "minute").toISOString();
    await plant.save();

    jest.clearAllMocks();
  });

  it("should return false if the plant has not been watered", () => {
    plant.lastWatering = undefined;

    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toBeFalsy();
  });

  it("should return false if the plant was watered too long ago", () => {
    // @ts-ignore
    plant.lastWatering = dayjs().subtract(40, "minute").toISOString(); // simulate last watering was 40 minutes ago
    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toBeFalsy();
  });

  it("should return false if the last plant cycle run was too recent", () => {
    // @ts-ignore
    plant.lastWatering = dayjs().subtract(25, "minute").toISOString();
    // @ts-ignore
    plant.lastPlantCycleRun = dayjs().subtract(10, "minute").toISOString();
    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toBeFalsy();
  });

  it("should return false if the plant was not watered after the last update", () => {
    // @ts-ignore
    plant.lastWatering = dayjs().subtract(25, "minute").toISOString();
    // @ts-ignore
    plant.lastPlantCycleRun = dayjs().subtract(20, "minute").toISOString();
    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toBeFalsy();
  });

  it("should return true if all conditions are met", () => {
    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toBeTruthy();
  });

  it("should not update plants if none are found", async () => {
    // set type that other thant plant
    plant.type = ItemType.Other;
    await plant.save();
    await plantGrowth.updatePlantGrowth();
    expect(Item.updateOne).not.toHaveBeenCalled();
  });

  it("should not update growth for plants that cannot grow", async () => {
    // set plant has not been watered.
    // @ts-ignore
    plant.lastWatering = null;
    await plant.save();

    await plantGrowth.updatePlantGrowth();

    expect(mockItemUpdateOne).not.toHaveBeenCalled();
  });

  it("should update growth points of plants if necessary", async () => {
    const growthPoints = 0;
    plant.growthPoints = growthPoints;
    await plant.save();
    await plantGrowth.updatePlantGrowth();
    expect(Item.updateOne).toHaveBeenCalledWith({ _id: plant._id }, { $set: { growthPoints: growthPoints + 1 } });
  });

  it("should advance plant cycle when required growth points are met", async () => {
    // Set required growth points for cycle advancement to MaturePlant (20)
    const growthPoints = 19;
    plant.growthPoints = growthPoints;
    plant.currentPlantCycle = PlantLifeCycle.Young;
    await plant.save();

    await plantGrowth.updatePlantGrowth();
    expect(Item.updateOne).toHaveBeenCalledWith(
      { _id: plant._id },
      {
        $set: {
          growthPoints: growthPoints + 1,
          currentPlantCycle: PlantLifeCycle.Mature,
          lastPlantCycleRun: expect.anything(),
        },
      }
    );
  });

  it("should handle plants in the harvestable stage when regrowsAfterHarvest is true", async () => {
    const growthPoints = 30;
    plant.currentPlantCycle = PlantLifeCycle.Young;
    plant.growthPoints = growthPoints;
    await plant.save();

    await plantGrowth.updatePlantGrowth();
    expect(Item.updateOne).toHaveBeenCalledWith(
      { _id: plant._id },
      {
        $set: {
          growthPoints: growthPoints + 1,
          currentPlantCycle: PlantLifeCycle.Mature,
          lastPlantCycleRun: expect.anything(),
        },
      }
    );
  });

  it("should handle plants in the harvestable stage when regrowsAfterHarvest is false", async () => {
    // @ts-ignore
    jest.spyOn(plantGrowth.blueprintManager, "getBlueprint").mockResolvedValueOnce({
      ...blueprint,
      regrowsAfterHarvest: false,
    });

    const growthPoints = 30;
    plant.currentPlantCycle = PlantLifeCycle.Mature;
    plant.growthPoints = growthPoints;
    await plant.save();

    await plantGrowth.updatePlantGrowth();
    expect(Item.updateOne).toHaveBeenCalledWith(
      { _id: plant._id },
      {
        $set: {
          growthPoints: growthPoints,
          currentPlantCycle: PlantLifeCycle.Mature,
          lastPlantCycleRun: expect.anything(),
        },
      }
    );
  });
});
