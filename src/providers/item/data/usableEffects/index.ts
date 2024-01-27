import { foodsUsableEffect } from "./FoodUsableEffect";
import { otherUsableEffects } from "./OtherUsableEffect";
import { potionsUsableEffects } from "./PotionsUsableEffect";
import { runesUsableEffects } from "./RunesUsableEffect";

const usableEffectsIndex = {
  ...foodsUsableEffect,
  ...runesUsableEffects,
  ...potionsUsableEffects,
  ...otherUsableEffects,
};

export { usableEffectsIndex };
