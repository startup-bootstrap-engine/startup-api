import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { container, unitTestHelper } from "@providers/inversify/container";
import { UseWithSocketEvents } from "@rpg-engine/shared";
import { WateringByRain } from "../WateringByRain";
import { IPlantItem } from "../data/blueprints/PlantItem";
import { PlantItemBlueprint } from "../data/types/PlantTypes";

describe("WateringByRain.ts", () => {
  let wateringByRain: WateringByRain;
  let plant: IItem;
  let blueprint: IPlantItem;
  let blueprintManager: BlueprintManager;

  beforeAll(() => {
    wateringByRain = container.get<WateringByRain>(WateringByRain);
    blueprintManager = container.get<BlueprintManager>(BlueprintManager);
  });

  beforeEach(async () => {
    blueprint = (await blueprintManager.getBlueprint("plants", PlantItemBlueprint.Carrot)) as IPlantItem;
    plant = await unitTestHelper.createMockItem(blueprint);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should not call wateringPlants if plant is dead", async () => {
    plant.isDead = true;
    await plant.save();

    const updatePlant = jest.spyOn(wateringByRain, "updatePlant");

    await wateringByRain.wateringPlants();
    expect(updatePlant).not.toBeCalled();
  });
  it("should call wateringPlants if plant is not dead", async () => {
    const updatePlant = jest.spyOn(wateringByRain, "updatePlant");

    await wateringByRain.wateringPlants();
    expect(updatePlant).toBeCalled();
  });

  it("should send event to all users if updatePlantGrowth is successful ", async () => {
    // @ts-ignore
    jest.spyOn(wateringByRain.plantGrowth, "updatePlantGrowth").mockResolvedValue(true);
    // @ts-ignore
    const sendEventToAllUsers = jest.spyOn(wateringByRain.socketMessaging, "sendEventToAllUsers");
    const itemUpdateSpy = jest.spyOn(Item, "updateOne");

    await wateringByRain.updatePlant(plant);

    expect(sendEventToAllUsers).toBeCalledWith(UseWithSocketEvents.UseWithWater, {
      status: true,
    });
    expect(itemUpdateSpy).toBeCalledWith({ _id: plant._id }, { $set: { isTileTinted: true } });
  });
});
