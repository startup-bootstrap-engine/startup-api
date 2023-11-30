import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CraftingResourcesBlueprint, FoodsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { MapLayers } from "@rpg-engine/shared";
import _ from "lodash";
import { IUseWithItemToTileReward, UseWithItemToTile } from "../abstractions/UseWithItemToTile";

describe("UseWithItemToTile.ts", () => {
  let useWithItemToTile: UseWithItemToTile;
  let skillIncrease: SkillIncrease;
  let testCharacter: ICharacter;

  beforeEach(async () => {
    useWithItemToTile = container.get<UseWithItemToTile>(UseWithItemToTile);
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
    });
    skillIncrease = container.get<SkillIncrease>(SkillIncrease);

    await Skill.updateOne(
      { owner: testCharacter._id },
      {
        $set: {
          mining: {
            level: 1,
          },
        },
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Validation", () => {
    it("should fail is required item is not available", async () => {
      const decrementRequiredItem = jest.spyOn(
        // @ts-ignore
        useWithItemToTile.characterItemInventory,
        "decrementItemFromInventoryByKey"
      );

      // @ts-ignore
      const sendErrorMessageToCharacter = jest.spyOn(useWithItemToTile.socketMessaging, "sendErrorMessageToCharacter");

      const result = await useWithItemToTile.execute(
        testCharacter,
        {
          requiredResource: {
            key: CraftingResourcesBlueprint.Worm,
            decrementQty: 1,
            errorMessage: "Sorry, you need a worm to fish.",
          },
          rewards: [
            {
              chance: 10,
              key: FoodsBlueprint.BrownFish,
              qty: 3,
            },
          ],
          targetTile: {
            layer: MapLayers.Ground,
            map: "test map",
            x: 32,
            y: 45,
          },
        },
        skillIncrease
      );

      expect(result).toBeUndefined();

      expect(decrementRequiredItem).not.toHaveBeenCalled();

      expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(testCharacter, "Sorry, you need a worm to fish.");
    });

    it("should fail when trying to add reward to inventory, but has no required skill", async () => {
      // mock lodash random to be 100

      jest.spyOn(_, "random").mockImplementation(() => 100);

      const mockRewards: IUseWithItemToTileReward[] = [
        {
          chance: 100,
          key: CraftingResourcesBlueprint.GoldenOre,
          qty: 3,
        },
      ];

      // @ts-ignore
      const result = await useWithItemToTile.addRewardToInventory(testCharacter, mockRewards);

      expect(result).toBe(false);
    });

    it("should not fail if the reward meets the minimum required level", async () => {
      await Skill.updateOne(
        { owner: testCharacter._id },
        {
          $set: {
            mining: {
              level: 100,
            },
          },
        }
      );

      const updatedCharacter = await Character.findById(testCharacter._id);

      // mock lodash random to be 100

      jest.spyOn(_, "random").mockImplementation(() => 100);

      const mockRewards: IUseWithItemToTileReward[] = [
        {
          chance: 100,
          key: CraftingResourcesBlueprint.GoldenOre,
          qty: 3,
        },
      ];

      // @ts-ignore
      const result = await useWithItemToTile.addRewardToInventory(updatedCharacter, mockRewards);

      expect(result).toBe(true);
    });
  });
});
