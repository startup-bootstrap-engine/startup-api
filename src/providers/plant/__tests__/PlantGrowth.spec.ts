/* eslint-disable no-unused-vars */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { MAXIMUM_MINUTES_FOR_GROW, MINIMUM_MINUTES_FOR_WATERING } from "@providers/constants/FarmingConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import { ItemSocketEvents, ItemSubType, ItemType } from "@rpg-engine/shared";
import dayjs from "dayjs";
import _ from "lodash";
import { PlantGrowth } from "../PlantGrowth";
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
  let errorMessages: string[] | undefined;
  let errorMessage: string;

  const mockSocketMessaging = {
    sendEventToCharactersAroundCharacter: jest.fn(),
    sendErrorMessageToCharacter: jest.fn(),
    sendEventToUser: jest.fn(),
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
    plant.lastWatering = now.subtract(MAXIMUM_MINUTES_FOR_GROW - MINIMUM_MINUTES_FOR_WATERING, "minute").toDate();

    plant.owner = testCharacter._id;
    await plant.save();

    // @ts-ignore
    plantGrowth.socketMessaging = mockSocketMessaging;
    errorMessage = "Sorry, you can't water now. Please try again";
    errorMessages = [errorMessage];

    jest.spyOn(_, "random").mockImplementation(() => 74);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("Watering", () => {
    it("should return canGrow true and canWater true if plant is watered within MAXIMUM_MINUTES_FOR_GROW minutes from plant", () => {
      const now = dayjs();
      plant.createdAt = now.subtract(MAXIMUM_MINUTES_FOR_GROW, "minute").toDate();
      plant.lastWatering = undefined;

      // @ts-ignore
      expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: true, canWater: true });
    });

    it("should return canGrow false and canWater true if plant is watered after MAXIMUM_MINUTES_FOR_GROW minutes from plant", () => {
      const now = dayjs();
      plant.createdAt = now.subtract(MAXIMUM_MINUTES_FOR_GROW + 1, "minute").toDate();
      plant.lastWatering = undefined;

      // @ts-ignore
      expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: false, canWater: true });
    });

    it("should return canGrow true and canWater true if plant is watered within range of MAXIMUM_MINUTES_FOR_GROW and MINIMUM_MINUTES_FOR_WATERING", () => {
      const now = dayjs();
      plant.lastWatering = now.subtract(MAXIMUM_MINUTES_FOR_GROW - MINIMUM_MINUTES_FOR_WATERING, "minute").toDate();

      // @ts-ignore
      expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: true, canWater: true });
    });

    it("should return canGrow false and canWater true if plant is watered more than MAXIMUM_MINUTES_FOR_GROW", () => {
      const now = dayjs();
      plant.lastWatering = now.subtract(MAXIMUM_MINUTES_FOR_GROW + 1, "minute").toDate();

      // @ts-ignore
      expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: false, canWater: true });
    });

    it("should return canGrow false and canWater false if plant is watered less than MINIMUM_HOURS_FOR_WATERING ", () => {
      const now = dayjs();
      plant.lastWatering = now.subtract(MINIMUM_MINUTES_FOR_WATERING - 1, "minute").toDate();

      // @ts-ignore
      expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: false, canWater: false });
    });

    it("should sendErrorMessageToCharacter if canWater is false  ", async () => {
      const now = dayjs();
      plant.lastWatering = now.subtract(MINIMUM_MINUTES_FOR_WATERING - 1, "minute").toDate();

      // @ts-ignore
      expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: false, canWater: false });

      await plantGrowth.updatePlantGrowth(plant, testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testCharacter,
        // "Sorry, the plant is not ready to be watered. Try again in a few minutes."
        expect.stringContaining("Sorry, the plant is not ready to be watered. Try again")
      );
    });
  });

  describe("Growth", () => {
    it("should plantGrowth return false if canGrow and canWater is false ", async () => {
      const now = dayjs();
      plant.lastWatering = now.subtract(MINIMUM_MINUTES_FOR_WATERING - 1, "minute").toDate();

      // @ts-ignore
      expect(plantGrowth.canPlantGrow(plant, blueprint)).toMatchObject({ canGrow: false, canWater: false });

      const result = await plantGrowth.updatePlantGrowth(plant, testCharacter);

      expect(result).toBeFalsy();
    });

    it("should plantGrowth return true and update lastWatering if canGrow is false and canWater is true ", async () => {
      const now = dayjs();
      plant.lastWatering = now.subtract(MAXIMUM_MINUTES_FOR_GROW + 1, "minute").toDate();

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
      const findByIdAndUpdateSpy = jest.spyOn(Item, "findByIdAndUpdate");
      const growthPoints = 0;
      plant.growthPoints = growthPoints;
      await plant.save();
      await plantGrowth.updatePlantGrowth(plant, testCharacter);
      expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(
        plant._id,
        {
          $set: {
            growthPoints: growthPoints + blueprint.growthFactor,
            lastWatering: expect.anything(),
            requiredGrowthPoints:
              blueprint.stagesRequirements[plant.currentPlantCycle ?? PlantLifeCycle.Seed].requiredGrowthPoints,
          },
        },
        {
          new: true,
          lean: { virtuals: true, defaults: true },
        }
      );

      const updatedPlant = (await Item.findById(plant._id)) as IPlantItem;
      const character = (await Character.findById(plant.owner).lean()) as ICharacter;

      expect(mockSocketMessaging.sendEventToCharactersAroundCharacter).toBeCalledWith(
        character,
        ItemSocketEvents.UpdateAll,
        {
          items: [
            {
              id: updatedPlant._id,
              texturePath: updatedPlant.texturePath,
              textureAtlas: updatedPlant.textureAtlas,
              type: updatedPlant.type as ItemType,
              subType: updatedPlant.subType as ItemSubType,
              name: updatedPlant.name,
              x: updatedPlant.x!,
              y: updatedPlant.y!,
              layer: updatedPlant.layer!,
              stackQty: updatedPlant.stackQty || 0,
              isDeadBodyLootable: updatedPlant.isDeadBodyLootable,
              lastWatering: expect.anything(),
              growthPoints: growthPoints + blueprint.growthFactor,
              requiredGrowthPoints: updatedPlant.requiredGrowthPoints,
            },
          ],
        },
        true
      );
    });

    it("should send socketMessaging to characters around character when advance to new plant cycle", async () => {
      const growthPoints =
        blueprint.stagesRequirements[plant.currentPlantCycle ?? PlantLifeCycle.Mature].requiredGrowthPoints - 1;
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
              lastWatering: expect.anything(),
              growthPoints: growthPoints + blueprint.growthFactor,
              requiredGrowthPoints: blueprint.stagesRequirements[PlantLifeCycle.Mature]?.requiredGrowthPoints,
            },
          ],
        },
        true
      );
    });

    it("should advance plant cycle when required growth points are met", async () => {
      const findByIdAndUpdateSpy = jest.spyOn(Item, "findByIdAndUpdate");

      const growthPoints =
        blueprint.stagesRequirements[plant.currentPlantCycle ?? PlantLifeCycle.Mature].requiredGrowthPoints - 1;
      plant.growthPoints = growthPoints;
      plant.currentPlantCycle = PlantLifeCycle.Young;
      await plant.save();

      await plantGrowth.updatePlantGrowth(plant, testCharacter);
      expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(
        plant._id,
        {
          $set: {
            growthPoints: growthPoints + blueprint.growthFactor,
            currentPlantCycle: PlantLifeCycle.Mature,
            lastPlantCycleRun: expect.anything(),
            lastWatering: expect.anything(),
            texturePath: blueprint.stagesRequirements[PlantLifeCycle.Mature]?.texturePath,
            requiredGrowthPoints: blueprint.stagesRequirements[PlantLifeCycle.Mature]?.requiredGrowthPoints,
          },
        },
        {
          new: true,
          lean: { virtuals: true, defaults: true },
        }
      );
    });

    it("should handle plants in the harvestable stage when regrowsAfterHarvest is true", async () => {
      const findByIdAndUpdateSpy = jest.spyOn(Item, "findByIdAndUpdate");

      const growthPoints =
        blueprint.stagesRequirements[plant.currentPlantCycle ?? PlantLifeCycle.Mature].requiredGrowthPoints - 1;
      plant.currentPlantCycle = PlantLifeCycle.Young;
      plant.growthPoints = growthPoints;
      await plant.save();

      await plantGrowth.updatePlantGrowth(plant, testCharacter);
      expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(
        plant._id,
        {
          $set: {
            growthPoints: growthPoints + blueprint.growthFactor,
            currentPlantCycle: PlantLifeCycle.Mature,
            lastPlantCycleRun: expect.anything(),
            lastWatering: expect.anything(),
            texturePath: blueprint.stagesRequirements[PlantLifeCycle.Mature]?.texturePath,
            requiredGrowthPoints: blueprint.stagesRequirements[PlantLifeCycle.Mature]?.requiredGrowthPoints,
          },
        },
        {
          new: true,
          lean: { virtuals: true, defaults: true },
        }
      );
    });

    it("should handle plants in the harvestable stage when regrowsAfterHarvest is false", async () => {
      const findByIdAndUpdateSpy = jest.spyOn(Item, "findByIdAndUpdate");

      // @ts-ignore
      jest.spyOn(blueprintManager, "getBlueprint").mockResolvedValueOnce({
        ...blueprint,
        regrowsAfterHarvest: false,
      });

      const growthPoints =
        blueprint.stagesRequirements[plant.currentPlantCycle ?? PlantLifeCycle.Mature].requiredGrowthPoints;
      plant.currentPlantCycle = PlantLifeCycle.Mature;
      plant.growthPoints = growthPoints;
      await plant.save();

      await plantGrowth.updatePlantGrowth(plant, testCharacter);
      expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(
        plant._id,
        {
          $set: {
            growthPoints: growthPoints,
            currentPlantCycle: PlantLifeCycle.Mature,
            lastPlantCycleRun: expect.anything(),
            lastWatering: expect.anything(),
            texturePath: blueprint.stagesRequirements[PlantLifeCycle.Mature]?.texturePath,
            requiredGrowthPoints: blueprint.stagesRequirements[PlantLifeCycle.Mature]?.requiredGrowthPoints,
          },
        },
        {
          new: true,
          lean: { virtuals: true, defaults: true },
        }
      );
    });
  });

  describe("Death", () => {
    it("should send an error message to the character if the plant is dead", async () => {
      plant.isDead = true;
      await plantGrowth.updatePlantGrowth(plant, testCharacter);

      expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
        testCharacter,
        "Sorry, the plant is already dead."
      );
    });
  });

  describe("Tint", () => {
    it("should update tinted tile plants correctly", async () => {
      plant.isTileTinted = true;
      await plant.save();

      await plantGrowth.checkAndUpdateTintedTilePlants();

      const updatedPlant = await Item.findOne({ _id: plant._id }).lean();
      expect(updatedPlant?.isTileTinted).toBe(false);
    });
  });
});
