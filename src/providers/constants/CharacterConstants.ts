import { CharacterFactions } from "@rpg-engine/shared";

type IInitialSpawnPoints = {
  [faction in CharacterFactions]: {
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
  [CharacterFactions.ShadowWalker]: {
    //! Temporarily using the same spawn point
    gridX: 26,
    gridY: 17,
    scene: "ilya-village-sewer",
  },
};
