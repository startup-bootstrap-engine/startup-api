import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { blueprintManager, container, unitTestHelper } from "@providers/inversify/container";
import { EntityType, MagicsBlueprint } from "@rpg-engine/shared";
import { IUseWithItemSource, UseWithEntity } from "../UseWithEntity";

describe("UseWithEntity", () => {
  let useWithEntity: UseWithEntity;
  let testCharacter: ICharacter;
  let testNPC: INPC;
  let testItem: IItem;
  let testItemBlueprint: IUseWithItemSource;

  beforeAll(() => {
    useWithEntity = container.get(UseWithEntity);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasSkills: true,
      hasEquipment: true,
    });
    testNPC = await unitTestHelper.createMockNPC();

    testItem = await unitTestHelper.createMockItemFromBlueprint(MagicsBlueprint.HealRune);

    testItemBlueprint = await blueprintManager.getBlueprint<IUseWithItemSource>("items", testItem.baseKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("execute method", () => {
    it("returns early if base request validation fails", async () => {
      // @ts-ignore
      jest.spyOn(useWithEntity.useWithEntityValidation, "baseValidation").mockReturnValueOnce(false);

      // @ts-ignore
      const validateTargetRequest = jest.spyOn(useWithEntity.useWithEntityValidation, "validateTargetRequest");

      testCharacter.isOnline = false;

      const payload = { entityId: testCharacter._id, itemId: testItem._id, entityType: EntityType.Character };

      await useWithEntity.execute(payload, testCharacter);

      expect(validateTargetRequest).not.toHaveBeenCalled();
    });

    it("executes effect on self when blueprint has self auto-target", async () => {
      // @ts-ignore
      jest.spyOn(useWithEntity.useWithEntityValidation, "baseValidation").mockReturnValueOnce(true);

      const selfTargetingBlueprint = { ...testItemBlueprint, hasSelfAutoTarget: true } as IUseWithItemSource;
      jest
        // @ts-ignore
        .spyOn(useWithEntity.blueprintManager, "getBlueprint")
        .mockResolvedValueOnce(selfTargetingBlueprint as never);

      // @ts-ignore
      const executeEffectSpy = jest.spyOn(useWithEntity, "executeEffect");

      const payload = { entityId: testCharacter._id, itemId: testItem._id, entityType: EntityType.Character };

      await useWithEntity.execute(payload, testCharacter);

      expect(executeEffectSpy).toHaveBeenCalledWith(testCharacter, testCharacter, expect.anything());
    });

    it("returns early if target request validation fails", async () => {
      testItemBlueprint.hasSelfAutoTarget = false;

      // @ts-ignore
      jest.spyOn(useWithEntity.useWithEntityValidation, "baseValidation").mockReturnValueOnce(true);

      // @ts-ignore
      jest.spyOn(useWithEntity.useWithEntityValidation, "validateTargetRequest").mockResolvedValueOnce(false);

      // @ts-ignore
      const executeEffectSpy = jest.spyOn(useWithEntity, "executeEffect");

      const payload = { entityId: testNPC._id, itemId: testItem._id, entityType: EntityType.NPC };

      await useWithEntity.execute(payload, testCharacter);

      // @ts-ignore
      expect(executeEffectSpy).not.toHaveBeenCalled();
    });

    it("executes effect with valid target", async () => {
      testItemBlueprint.hasSelfAutoTarget = false;

      // @ts-ignore
      jest.spyOn(useWithEntity.useWithEntityValidation, "baseValidation").mockReturnValueOnce(true);

      // @ts-ignore
      jest.spyOn(useWithEntity.useWithEntityValidation, "validateTargetRequest").mockResolvedValueOnce(true);

      // @ts-ignore
      const executeEffectSpy = jest.spyOn(useWithEntity, "executeEffect");

      const payload = { entityId: testNPC._id, itemId: testItem._id, entityType: EntityType.NPC };

      await useWithEntity.execute(payload, testCharacter);

      expect(executeEffectSpy).toHaveBeenCalled();
    });
  });
});
