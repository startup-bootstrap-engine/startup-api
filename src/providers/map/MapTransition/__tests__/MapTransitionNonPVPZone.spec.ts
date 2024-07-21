import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { NPC } from "@entities/ModuleNPC/NPCModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { MapNonPVPZone } from "@providers/map/MapNonPVPZone";
import { NPCAlignment } from "@rpg-engine/shared";
import { MapTransitionNonPVPZone } from "../MapTransitionNonPvpZone";

describe("MapTransitionNonPVPZone", () => {
  let mapTransitionNonPVPZone: MapTransitionNonPVPZone;
  let testCharacter: ICharacter;

  beforeAll(() => {
    mapTransitionNonPVPZone = container.get<MapTransitionNonPVPZone>(MapTransitionNonPVPZone);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();
  });

  it("should not stop attack if character has no target", async () => {
    // @ts-ignore
    testCharacter.target = null;
    await testCharacter.save();

    // @ts-ignore
    const stopAttackSpy = jest.spyOn(MapNonPVPZone.prototype, "stopCharacterAttack");

    await mapTransitionNonPVPZone.handleNonPVPZone(testCharacter, 10, 20);

    expect(stopAttackSpy).not.toHaveBeenCalled();
  });

  it("should not stop attack if target is not a friendly NPC", async () => {
    const mockNPC = { alignment: NPCAlignment.Hostile };
    jest.spyOn(NPC, "findById").mockReturnValue({
      lean: jest.fn().mockReturnValue(mockNPC),
    } as any);
    const stopAttackSpy = jest.spyOn(MapNonPVPZone.prototype, "stopCharacterAttack");

    // @ts-ignore
    await mapTransitionNonPVPZone.handleNonPVPZone({ ...testCharacter, target: { id: "npc-id", type: "NPC" } }, 10, 20);

    expect(stopAttackSpy).not.toHaveBeenCalled();
  });

  it("should stop attack in non-PVP zone with friendly NPC target", async () => {
    const mockNPC = { alignment: NPCAlignment.Friendly };
    jest.spyOn(NPC, "findById").mockReturnValue({
      lean: jest.fn().mockReturnValue(mockNPC),
    } as any);
    jest.spyOn(MapNonPVPZone.prototype, "isNonPVPZoneAtXY").mockReturnValue(true);

    const stopAttackSpy = jest.spyOn(MapNonPVPZone.prototype, "stopCharacterAttack");

    await mapTransitionNonPVPZone.handleNonPVPZone({ ...testCharacter, target: { id: "npc-id", type: "NPC" } }, 10, 20);

    expect(stopAttackSpy).toHaveBeenCalled();
  });
});
