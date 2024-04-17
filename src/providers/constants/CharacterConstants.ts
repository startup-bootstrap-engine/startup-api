import { CharacterFactions } from "@rpg-engine/shared";

export enum CharacterGameMode {
  Farming = "Farming Mode",
}

type IInitialSpawnPoints = {
  [faction in CharacterFactions]: {
    gridX: number;
    gridY: number;
    scene: string;
  };
} & {
  [mode in CharacterGameMode]?: {
    gridX: number;
    gridY: number;
    scene: string;
  };
};

export const INITIAL_STARTING_POINTS: IInitialSpawnPoints = {
  [CharacterFactions.LifeBringer]: {
    gridX: 26,
    gridY: 17,
    scene: "ilya-village-sewer",
  },
  [CharacterGameMode.Farming]: {
    gridX: 114,
    gridY: 46,
    scene: "farm-land",
  },
  [CharacterFactions.ShadowWalker]: {
    //! Temporarily using the same spawn point
    gridX: 26,
    gridY: 17,
    scene: "ilya-village-sewer",
  },
};
