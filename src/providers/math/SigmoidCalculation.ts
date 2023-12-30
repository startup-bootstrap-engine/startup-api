import { provide } from "inversify-binding-decorators";

@provide(SigmoidCalculation)
export class SigmoidCalculation {
  public sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  public sigmoidMinMax(x: number, min: number, max: number): number {
    const sigmoidValue = 1 / (1 + Math.exp(-x));
    return min + sigmoidValue * (max - min);
  }
}
