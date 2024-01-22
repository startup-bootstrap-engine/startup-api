import { UsableEffectsBlueprint } from "../types";
import { bombUsableEffect } from "./bombUsableEffect";

export const otherUsableEffects = {
  [UsableEffectsBlueprint.BombUsableEffect]: bombUsableEffect,
};
