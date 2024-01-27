import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { container, unitTestHelper } from "@providers/inversify/container";
import { ItemSocketEvents, ItemSubType, ItemType } from "@rpg-engine/shared";
import dayjs from "dayjs";
import { MAXIMUM_HOURS_FOR_GROW, MINIMUM_HOURS_FOR_WATERING, PlantGrowth } from "../PlantGrowth";
import { IPlantItem } from "../data/blueprints/PlantItem";
import { PlantItemBlueprint, PlantLifeCycle } from "../data/types/PlantTypes";

describe("PlantGrowth.ts", () => {
  let plantGrowth: PlantGrowth;
  let plant: IItem;
  let blueprint: IPlantItem;
  let mockItemUpdateOne: jest.Mock;
  let mockItemFindByIdAndUpdate: jest.Mock;
  let testCharacter: ICharacter;
  let blueprintManager: BlueprintManager;

  const mockSocketMessaging = {
    sendEventToCharactersAroundCharacter: jest.fn(),
    sendErrorMessageToCharacter: jest.fn(),
  };

  beforeAll(() => {
    plantGrowth = container.get<PlantGrowth>(PlantGrowth);
    blueprintManager = container.get<BlueprintManager>(BlueprintManager);

    mockItemUpdateOne = jest.fn();
    Item.updateOne = mockItemUpdateOne;
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();

    blueprint = (await blueprintManager.getBlueprint("plants", PlantItemBlueprint.Carrot)) as IPlantItem;
    plant = await unitTestHelper.createMockItem(blueprint);

    const now = dayjs();
    plant.lastWatering = now.subtract(MAXIMUM_HOURS_FOR_GROW - MINIMUM_HOURS_FOR_WATERING, "hour").toDate();

    plant.owner = testCharacter._id;
    await plant.save();

    // @ts-ignore
    plantGrowth.socketMessaging = mockSocketMessaging;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should return canGrow true and canWater true if plant is watered within MAXIMUM_HOURS_FOR_GROW hours from plant", () => {
    const now = dayjs();
    plant.createdAt = now.subtract(MAXIMUM_HOURS_FOR_GROW, "hour").toDate();
    plant.lastWatering = undefined;

    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: true, canWater: true });
  });

  it("should return canGrow false and canWater true if plant is watered after MAXIMUM_HOURS_FOR_GROW hours from plant", () => {
    const now = dayjs();
    plant.createdAt = now.subtract(MAXIMUM_HOURS_FOR_GROW + 1, "hour").toDate();
    plant.lastWatering = undefined;

    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: false, canWater: true });
  });

  it("should return canGrow true and canWater true if plant is watered within range of MAXIMUM_HOURS_FOR_GROW and MINIMUM_HOURS_FOR_WATERING ", () => {
    const now = dayjs();
    plant.lastWatering = now.subtract(MAXIMUM_HOURS_FOR_GROW - MINIMUM_HOURS_FOR_WATERING, "hour").toDate();

    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: true, canWater: true });
  });

  it("should return canGrow false and canWater true if plant is watered more than MAXIMUM_HOURS_FOR_GROW", () => {
    const now = dayjs();
    plant.lastWatering = now.subtract(MAXIMUM_HOURS_FOR_GROW + 1, "hour").toDate();

    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: false, canWater: true });
  });

  it("should return canGrow false and canWater false if plant is watered less than MINIMUM_HOURS_FOR_WATERING ", () => {
    const now = dayjs();
    plant.lastWatering = now.subtract(MINIMUM_HOURS_FOR_WATERING, "hour").toDate();

    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: false, canWater: false });
  });

  it("should sendErrorMessageToCharacter if canWater is false  ", async () => {
    const now = dayjs();
    plant.lastWatering = now.subtract(MINIMUM_HOURS_FOR_WATERING, "hour").toDate();

    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: false, canWater: false });

    await plantGrowth.updatePlantGrowth(plant, testCharacter);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacter,
      "Sorry, the plant is not ready to be watered."
    );
  });

  it("should plantGrowth return false if canGrow and canWater is false ", async () => {
    const now = dayjs();
    plant.lastWatering = now.subtract(MINIMUM_HOURS_FOR_WATERING, "hour").toDate();

    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: false, canWater: false });

    const result = await plantGrowth.updatePlantGrowth(plant, testCharacter);

    expect(result).toBeFalsy();
  });

  it("should plantGrowth return true and update lastWatering if canGrow is false and canWater is true ", async () => {
    const now = dayjs();
    plant.lastWatering = now.subtract(MAXIMUM_HOURS_FOR_GROW + 1, "hour").toDate();

    // @ts-ignore
    expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: false, canWater: true });

    const result = await plantGrowth.updatePlantGrowth(plant, testCharacter);

    expect(Item.updateOne).toHaveBeenCalledWith(
      { _id: plant._id },
      {
        $set: {
          lastWatering: expect.anything(),
        },
      }
    );

    expect(result).toBeTruthy();
  });

  it("should update growth points of plants if necessary", async () => {
    const growthPoints = 0;
    plant.growthPoints = growthPoints;
    await plant.save();
    await plantGrowth.updatePlantGrowth(plant, testCharacter);
    expect(Item.updateOne).toHaveBeenCalledWith(
      { _id: plant._id },
      { $set: { growthPoints: growthPoints + 1, lastWatering: expect.anything() } }
    );
  });

  it("should send socketMessaging to characters around character when advance to new plant cycle", async () => {
    // Set required growth points for cycle advancement to MaturePlant (20)
    const growthPoints = 19;
    plant.growthPoints = growthPoints;
    plant.currentPlantCycle = PlantLifeCycle.Young;
    await plant.save();

    await plantGrowth.updatePlantGrowth(plant, testCharacter);

    const character = (await Character.findById(plant.owner).lean()) as ICharacter;
    expect(mockSocketMessaging.sendEventToCharactersAroundCharacter).toBeCalledWith(
      character,
      ItemSocketEvents.UpdateAll,
      {
        items: [
          {
            id: plant._id,
            texturePath: blueprint.stagesRequirements[PlantLifeCycle.Mature]?.texturePath,
            textureAtlas: plant.textureAtlas,
            type: plant.type as ItemType,
            subType: plant.subType as ItemSubType,
            name: plant.name,
            x: plant.x!,
            y: plant.y!,
            layer: plant.layer!,
            stackQty: plant.stackQty || 0,
            isDeadBodyLootable: plant.isDeadBodyLootable,
          },
        ],
      },
      true
    );
  });

  it("should advance plant cycle when required growth points are met", async () => {
    mockItemFindByIdAndUpdate = jest.fn();
    Item.findByIdAndUpdate = mockItemFindByIdAndUpdate;
    // Set required growth points for cycle advancement to MaturePlant (20)
    const growthPoints = 19;
    plant.growthPoints = growthPoints;
    plant.currentPlantCycle = PlantLifeCycle.Young;
    await plant.save();

    await plantGrowth.updatePlantGrowth(plant, testCharacter);
    expect(Item.findByIdAndUpdate).toHaveBeenCalledWith(
      plant._id,
      {
        $set: {
          growthPoints: growthPoints + 1,
          currentPlantCycle: PlantLifeCycle.Mature,
          lastPlantCycleRun: expect.anything(),
          lastWatering: expect.anything(),
          texturePath: blueprint.stagesRequirements[PlantLifeCycle.Mature]?.texturePath,
        },
      },
      {
        new: true,
        lean: { virtuals: true, defaults: true },
      }
    );
  });

  it("should handle plants in the harvestable stage when regrowsAfterHarvest is true", async () => {
    mockItemFindByIdAndUpdate = jest.fn();
    Item.findByIdAndUpdate = mockItemFindByIdAndUpdate;

    const growthPoints = 30;
    plant.currentPlantCycle = PlantLifeCycle.Young;
    plant.growthPoints = growthPoints;
    await plant.save();

    await plantGrowth.updatePlantGrowth(plant, testCharacter);
    expect(Item.findByIdAndUpdate).toHaveBeenCalledWith(
      plant._id,
      {
        $set: {
          growthPoints: growthPoints + 1,
          currentPlantCycle: PlantLifeCycle.Mature,
          lastPlantCycleRun: expect.anything(),
          lastWatering: expect.anything(),
          texturePath: blueprint.stagesRequirements[PlantLifeCycle.Mature]?.texturePath,
        },
      },
      {
        new: true,
        lean: { virtuals: true, defaults: true },
      }
    );
  });

  it("should handle plants in the harvestable stage when regrowsAfterHarvest is false", async () => {
    mockItemFindByIdAndUpdate = jest.fn();
    Item.findByIdAndUpdate = mockItemFindByIdAndUpdate;

    // @ts-ignore
    jest.spyOn(blueprintManager, "getBlueprint").mockResolvedValueOnce({
      ...blueprint,
      regrowsAfterHarvest: false,
    });

    const growthPoints = 30;
    plant.currentPlantCycle = PlantLifeCycle.Mature;
    plant.growthPoints = growthPoints;
    await plant.save();

    await plantGrowth.updatePlantGrowth(plant, testCharacter);
    expect(Item.findByIdAndUpdate).toHaveBeenCalledWith(
      plant._id,
      {
        $set: {
          growthPoints: growthPoints,
          currentPlantCycle: PlantLifeCycle.Mature,
          lastPlantCycleRun: expect.anything(),
          lastWatering: expect.anything(),
          texturePath: blueprint.stagesRequirements[PlantLifeCycle.Mature]?.texturePath,
        },
      },
      {
        new: true,
        lean: { virtuals: true, defaults: true },
      }
    );
  });
});
