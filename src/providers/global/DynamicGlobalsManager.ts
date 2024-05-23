import { DEFAULT_XP_RATIO } from "@providers/constants/GlobalXpRatioConstants";
import { provideSingleton } from "@providers/inversify/provideSingleton";

@provideSingleton(DynamicGlobalsManager)
export class DynamicGlobalsManager {
  private static _XpRatio: number = DEFAULT_XP_RATIO;
  private constructor() {}

  public static updateXpRatio(newRatio: number): void {
    this._XpRatio = newRatio;
  }

  public static getXpRatio(): number {
    return this._XpRatio;
  }
}
