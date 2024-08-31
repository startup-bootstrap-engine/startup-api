import { INPC } from "@entities/ModuleNPC/NPCModel";
import { AnimationDirection, CharacterClass, MapLayers, NPCMovementType, NPCPathOrientation } from "@rpg-engine/shared";
import _ from "lodash";

interface INPCMovement {
  direction: AnimationDirection;
  class: CharacterClass;
  layer: MapLayers;
  speed: number;
  originalMovementType: NPCMovementType;
  currentMovementType: NPCMovementType;
  maxRangeInGridCells: number;
  maxAntiLuringRangeInGridCells?: number;
  pathOrientation?: NPCPathOrientation;
}

const generateBaseNPCProperties = (): Partial<INPC> => {
  return {
    direction: "down" as AnimationDirection,
    class: CharacterClass.None,
    layer: MapLayers.Character,
    speed: _.random(1, 2),
  };
};

export const generateRandomMovement = (): INPCMovement => {
  return {
    ...generateBaseNPCProperties(),
    originalMovementType: NPCMovementType.Random,
    currentMovementType: NPCMovementType.Random,
    maxRangeInGridCells: 5,
  } as INPCMovement;
};

export const generateMoveTowardsMovement = (): INPCMovement => {
  return {
    ...generateBaseNPCProperties(),
    originalMovementType: NPCMovementType.MoveTowards,
    currentMovementType: NPCMovementType.MoveTowards,
    maxRangeInGridCells: 8,
    maxAntiLuringRangeInGridCells: 40,
    pathOrientation: NPCPathOrientation.Forward, // must be forward!
  } as INPCMovement;
};

export const generateStoppedMovement = (): INPCMovement => {
  return {
    ...generateBaseNPCProperties(),
    currentMovementType: NPCMovementType.Stopped,
    originalMovementType: NPCMovementType.Stopped,
    maxRangeInGridCells: 5,
  } as INPCMovement;
};

export const generateMoveAwayMovement = (): INPCMovement => {
  return {
    ...generateBaseNPCProperties(),
    currentMovementType: NPCMovementType.MoveAway,
    originalMovementType: NPCMovementType.MoveAway,
    maxRangeInGridCells: 20,
  } as INPCMovement;
};

export const generateFixedPathMovement = (): INPCMovement => {
  return {
    ...generateBaseNPCProperties(),
    currentMovementType: NPCMovementType.FixedPath,
    originalMovementType: NPCMovementType.FixedPath,
    pathOrientation: NPCPathOrientation.Forward, // must be forward!
    maxRangeInGridCells: 20,
  } as INPCMovement;
};
