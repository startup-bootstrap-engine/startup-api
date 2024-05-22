import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill, Skill } from "@entities/ModuleCharacter/SkillsModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { blueprintManager, container, unitTestHelper } from "@providers/inversify/container";
import { ItemType } from "@rpg-engine/shared";
import { PlantHarvest } from "../PlantHarvest";
import { IPlantItem } from "../data/blueprints/PlantItem";
import { PlantItemBlueprint, PlantLifeCycle } from "../data/types/PlantTypes";

describe("PlantHarvest.ts", () => {
  let testCharacter: ICharacter;
  let plant: IItem;
  let plantHarvest: PlantHarvest;
  let blueprint: IPlantItem;
  let inventory: IItem;
  let inventoryContainer: IItemContainer;

  const mockSocketMessaging = {
    sendErrorMessageToCharacter: jest.fn(),
    sendMessageToCharacter: jest.fn(),
    sendEventToCharactersAroundCharacter: jest.fn(),
    sendEventToUser: jest.fn(),
  };

  const farmingSkillLevel = 10;

  let mockSkillIncrease: jest.SpyInstance;

  beforeAll(() => {
    plantHarvest = container.get<PlantHarvest>(PlantHarvest);
  });

  beforeEach(async () => {
    testCharacter = await await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
    });

    const testCharacterSkills = (await Skill.findById(testCharacter.skills)) as ISkill;
    testCharacterSkills.farming.level = farmingSkillLevel;
    await testCharacterSkills.save();

    blueprint = (await blueprintManager.getBlueprint("plants", PlantItemBlueprint.Carrot)) as IPlantItem;
    plant = await unitTestHelper.createMockItem(blueprint);

    plant.owner = testCharacter._id;
    plant.currentPlantCycle = PlantLifeCycle.Mature;
    await plant.save();

    // @ts-expect-error
    plantHarvest.socketMessaging = mockSocketMessaging;

    inventory = await testCharacter.inventory;
    inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should return false if the plant is not mature", async () => {
    plant.currentPlantCycle = undefined;

    await plantHarvest.harvestPlant(plant, testCharacter);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacter,
      "Sorry, your plant is not mature enough to be harvested."
    );
  });

  it("should return false if the plant blueprint could not be found", async () => {
    plant.key = "invalid-key";

    await plantHarvest.harvestPlant(plant, testCharacter);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacter,
      "Sorry, the plant blueprint could not be found."
    );
  });

  it("should return false if character dose not have a inventory", async () => {
    const testCharacterWithoutInventory = await unitTestHelper.createMockCharacter(null, {
      hasSkills: true,
    });
    plant.owner = testCharacterWithoutInventory._id;

    await plantHarvest.harvestPlant(plant, testCharacterWithoutInventory);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacterWithoutInventory,
      "Sorry,You don't have an inventory."
    );
  });

  it("should harvest the plant, remove it and add the item to the character's inventory if regrowsAfterHarvest is false", async () => {
    // @ts-ignore
    mockSkillIncrease = jest.spyOn(plantHarvest.skillIncrease, "increaseCraftingSP");

    blueprint.regrowsAfterHarvest = false;
    // @ts-ignore
    const harvestQty = plantHarvest.calculateCropYield(farmingSkillLevel, blueprint);
    await plantHarvest.harvestPlant(plant, testCharacter);

    expect(mockSkillIncrease).toHaveBeenCalledWith(testCharacter, ItemType.Plant, true);

    const updatedInventoryContainer = await ItemContainer.findById(inventoryContainer._id);
    expect(updatedInventoryContainer?.slots[0]).not.toBeNull();
    expect(updatedInventoryContainer?.slots[0].stackQty).toEqual(harvestQty);
    expect(updatedInventoryContainer?.slots[0].key).toEqual(blueprint.harvestableItemKey);

    const updatedPlant = await Item.findById(plant._id);
    expect(updatedPlant).toBeNull();
  });

  it("should harvest the plant, change PlantLifeCycle to seed and add the item to the character's inventory if regrowsAfterHarvest is true", async () => {
    //
    blueprint.regrowsAfterHarvest = true;
    blueprint.regrowAfterHarvestLimit = 2;

    // @ts-ignore
    const harvestQty = plantHarvest.calculateCropYield(farmingSkillLevel, blueprint);
    await plantHarvest.harvestPlant(plant, testCharacter);

    await plantHarvest.harvestPlant(plant, testCharacter);

    expect(mockSocketMessaging.sendEventToUser).toBeCalled();
    const updatedInventoryContainer = await ItemContainer.findById(inventoryContainer._id);
    expect(updatedInventoryContainer?.slots[0]).not.toBeNull();
    expect(updatedInventoryContainer?.slots[0].stackQty).toEqual(harvestQty);
    expect(updatedInventoryContainer?.slots[0].key).toEqual(blueprint.harvestableItemKey);

    const updatedPlant = await Item.findById(plant._id);
    expect(updatedPlant).not.toBeNull();
    expect(updatedPlant?.currentPlantCycle).toEqual(PlantLifeCycle.Seed);
    expect(updatedPlant?.texturePath).toEqual(blueprint.stagesRequirements[PlantLifeCycle.Seed]?.texturePath);
    expect(updatedPlant?.requiredGrowthPoints).toEqual(
      blueprint.stagesRequirements[PlantLifeCycle.Seed]?.requiredGrowthPoints
    );
    expect(updatedPlant?.growthPoints).toEqual(0);
  });

  it("should send an error message to the character if the plant is dead", async () => {
    plant.isDead = true;
    await plantHarvest.harvestPlant(plant, testCharacter);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacter,
      "Sorry, you can't harvest the plant because it is already dead."
    );
  });

  it("should remove the plant if the regrowAfterHarvestLimit is reached", async () => {
    blueprint.regrowsAfterHarvest = true;
    blueprint.regrowAfterHarvestLimit = 2;

    plant.regrowthCount = 2;

    await plantHarvest.harvestPlant(plant, testCharacter);
    const updatedPlant = await Item.findById(plant._id);
    expect(updatedPlant).toBeNull();
  });

  it("should add rarity to the crops", async () => {
    await plantHarvest.harvestPlant(plant, testCharacter);
    const updatedInventoryContainer = await ItemContainer.findById(inventoryContainer._id);

    expect(updatedInventoryContainer?.slots[0]).not.toBeNull();
    expect(updatedInventoryContainer?.slots[0].key).toEqual(blueprint.harvestableItemKey);
    expect(updatedInventoryContainer?.slots[0].rarity).not.toBeNull();
  });
});
