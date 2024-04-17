import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { PlantItemBlueprint } from "@providers/plant/data/types/PlantTypes";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { AnimationEffectKeys, ItemType } from "@rpg-engine/shared";
import _ from "lodash";
import { IUseWithRemove, UseWithItemToRemove } from "../abstractions/UseWithItemToRemove";

describe("UseWithItemToRemove.ts", () => {
  let useWithItemToRemove: UseWithItemToRemove;
  let testCharacter: ICharacter;
  let testPlant: IItem;
  let useWithItemToRemoveData: IUseWithRemove;
  let skillIncrease: SkillIncrease;

  const mockSocketMessaging = {
    sendMessageToCharacter: jest.fn(),
    sendErrorMessageToCharacter: jest.fn(),
  };

  beforeAll(() => {
    useWithItemToRemove = container.get<UseWithItemToRemove>(UseWithItemToRemove);
    skillIncrease = container.get<SkillIncrease>(SkillIncrease);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
    });

    testPlant = await unitTestHelper.createMockItemFromBlueprint(PlantItemBlueprint.Cabbage);
    testPlant.type = ItemType.Plant;
    testPlant.isDead = true;
    testPlant.owner = testCharacter._id;
    await testPlant.save();

    useWithItemToRemoveData = {
      targetItem: testPlant,
      successAnimationEffectKey: AnimationEffectKeys.Rooted,
      errorMessages: ["Sorry, removal is not possible at the moment. Please try again"],
      successMessages: ["Removal has been completed successfully."],
    };
    // @ts-ignore
    useWithItemToRemove.socketMessaging = mockSocketMessaging;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should sends an error message if the target item is not a plant", async () => {
    useWithItemToRemoveData.targetItem = { type: "test" } as IItem;
    await useWithItemToRemove.executeUse(testCharacter, useWithItemToRemoveData, skillIncrease);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toBeCalledWith(
      testCharacter,
      "Sorry, you can only remove plants."
    );
  });

  it("should sends an error message if random number is greater than 75", async () => {
    jest.spyOn(_, "random").mockImplementation(() => 76);

    // @ts-expect-error
    const sendRandomMessageToCharacterMock = jest.spyOn(useWithItemToRemove, "sendRandomMessageToCharacter");

    await useWithItemToRemove.executeUse(testCharacter, useWithItemToRemoveData, skillIncrease);

    expect(sendRandomMessageToCharacterMock).toBeCalledWith(
      testCharacter,
      useWithItemToRemoveData.errorMessages,
      false
    );
  });

  it("should properly remove the item when random number is less than 75", async () => {
    jest.spyOn(_, "random").mockImplementation(() => 70);

    // @ts-expect-error
    const sendRandomMessageToCharacterMock = jest.spyOn(useWithItemToRemove, "sendRandomMessageToCharacter");

    const skillIncreaseMock = jest.spyOn(skillIncrease, "increaseCraftingSP");

    await useWithItemToRemove.executeUse(testCharacter, useWithItemToRemoveData, skillIncrease);

    const updatedPlant = await Item.findById(testPlant._id);
    expect(updatedPlant).toBeNull();

    expect(sendRandomMessageToCharacterMock).toBeCalledWith(
      testCharacter,
      useWithItemToRemoveData.successMessages,
      true
    );

    expect(skillIncreaseMock).toHaveBeenCalledWith(testCharacter, ItemType.Plant, true);
  });
});
