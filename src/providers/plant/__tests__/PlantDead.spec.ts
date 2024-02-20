import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { MAX_HOURS_NO_WATER_DEAD } from "@providers/constants/FarmingConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import { PlantDead } from "../PlantDead";
import { IPlantItem } from "../data/blueprints/PlantItem";
import { PlantItemBlueprint } from "../data/types/PlantTypes";

describe("PlantDead.ts", () => {
  let plantDead: PlantDead;
  let plant: IItem;
  let blueprint: IPlantItem;
  let blueprintManager: BlueprintManager;
  let testCharacter: ICharacter;
  let updatePlantTexture: jest.SpyInstance;

  beforeAll(() => {
    plantDead = container.get<PlantDead>(PlantDead);
    blueprintManager = container.get<BlueprintManager>(BlueprintManager);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();

    blueprint = (await blueprintManager.getBlueprint("plants", PlantItemBlueprint.Carrot)) as IPlantItem;
    plant = await unitTestHelper.createMockItem(blueprint);

    plant.owner = testCharacter._id;
    await plant.save();

    // @ts-ignore
    updatePlantTexture = jest.spyOn(plantDead.plantGrowth, "updatePlantTexture");
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should not call updatePlantTexture for dead plants", async () => {
    plant.isDead = true;
    await plant.save();

    await plantDead.checkUpdateDeadPlants();
    expect(updatePlantTexture).not.toHaveBeenCalled();
  });

  it("should not call updatePlantTexture for plants watered within the allowed time frame", async () => {
    plant.lastWatering = new Date(Date.now() - (MAX_HOURS_NO_WATER_DEAD - 1) * 60 * 60 * 1000);
    await plant.save();

    await plantDead.checkUpdateDeadPlants();
    expect(updatePlantTexture).not.toHaveBeenCalled();
  });

  it("should not call updatePlantTexture for plants not watered since planting, if not older than the maximum drought duration", async () => {
    plant.lastWatering = undefined;
    plant.createdAt = new Date(Date.now() - (MAX_HOURS_NO_WATER_DEAD - 1) * 60 * 60 * 1000);
    await plant.save();

    await plantDead.checkUpdateDeadPlants();
    expect(updatePlantTexture).not.toHaveBeenCalled();
  });

  it("should call updatePlantTexture and changes the plant texture for plants that have not been watered within the maximum drought duration", async () => {
    plant.lastWatering = new Date(Date.now() - MAX_HOURS_NO_WATER_DEAD * 60 * 60 * 1000);
    await plant.save();

    await plantDead.checkUpdateDeadPlants();
    const updatePlant = await Item.findById(plant._id);
    expect(updatePlantTexture).toHaveBeenCalled();
    expect(updatePlant?.texturePath).toBe(blueprint.deadTexturePath);
  });
});
