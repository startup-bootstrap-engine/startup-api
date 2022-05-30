import { CharacterGender, NPCMovementType, NPCPathOrientation } from "@rpg-engine/shared";
import {
  generateFixedPathMovement,
  generateMoveAwayMovement,
  generateMoveTowardsMovement,
  generateRandomMovement,
  generateStoppedMovement,
} from "../../npc/data/abstractions/BaseNeutralNPC";

export const randomMovementMockNPC = {
  ...generateRandomMovement(),
  key: "test-npc-22",
  name: "Test NPC",
  textureKey: "female-npc",
  gender: CharacterGender.Female,
  x: 144,
  y: 128,
  initialX: 144,
  initialY: 128,
  socketTransmissionZone: {
    x: -648,
    y: -664,
    width: 936,
    height: 920,
  },
  scene: "MainScene",
  tiledId: 0,
  spawnIntervalMin: 1,
};

export const stoppedMovementMockNPC = {
  ...generateStoppedMovement(),
  key: "test-npc-22",
  name: "Test NPC",
  textureKey: "female-npc",
  gender: CharacterGender.Female,
  x: 0,
  y: 0,
  initialX: 0,
  initialY: 0,
  socketTransmissionZone: {
    x: -648,
    y: -664,
    width: 936,
    height: 920,
  },
  scene: "MainScene",
  tiledId: 0,
  spawnIntervalMin: 1,
};

export const moveAwayMockNPC = {
  ...generateMoveAwayMovement(),
  key: "test-npc-22",
  name: "Test NPC",
  textureKey: "female-npc",
  gender: CharacterGender.Female,
  x: 0,
  y: 0,
  initialX: 0,
  initialY: 0,
  socketTransmissionZone: {
    x: -648,
    y: -664,
    width: 936,
    height: 920,
  },
  scene: "MainScene",
  tiledId: 0,
  spawnIntervalMin: 1,
};

export const moveTowardsMockNPC = {
  ...generateMoveTowardsMovement(),
  key: "test-npc-22",
  name: "Test NPC",
  textureKey: "female-npc",
  gender: CharacterGender.Female,
  x: 0,
  y: 0,
  initialX: 0,
  initialY: 0,
  socketTransmissionZone: {
    x: -648,
    y: -664,
    width: 936,
    height: 920,
  },
  maxRangeInGridCells: 10,
  scene: "MainScene",
  tiledId: 0,
  spawnIntervalMin: 1,
};

export const fixedPathMockNPC = {
  ...generateFixedPathMovement(),
  key: "test-npc-22",
  name: "Test NPC",
  textureKey: "female-npc",
  gender: CharacterGender.Female,
  x: 144,
  y: 128,
  initialX: 144,
  initialY: 128,
  socketTransmissionZone: {
    x: -648,
    y: -664,
    width: 936,
    height: 920,
  },
  scene: "MainScene",
  tiledId: 0,
  currentMovementType: NPCMovementType.FixedPath,
  originalMovementType: NPCMovementType.FixedPath,
  fixedPath: {
    endGridX: 9,
    endGridY: 11,
  },
  pathOrientation: NPCPathOrientation.Forward, // must be forward!
  maxRangeInGridCells: 20,
  spawnIntervalMin: 1,
};
