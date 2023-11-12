import { provide } from "inversify-binding-decorators";
import { round } from "lodash";

@provide(LinearInterpolation)
export class LinearInterpolation {
  public calculateLinearInterpolation(
    value: number,
    min: number,
    max: number,
    association: "default" | "reverse" = "default"
  ): number {
    if (association === "default") {
      // Linear interpolation formula for default skill association (higher skill, higher the value)
      value = min + ((max - min) * (value - 1)) / 99;
    } else {
      // Linear interpolation formula for reverse skill association (higher skill, lower the value)
      value = max - ((max - min) * (value - 1)) / 99;
    }

    return round(value);
  }

  public calculateMultiPointInterpolation(
    inputValue: number,
    inputRange: [number, number],
    outputRange: [number, number]
  ): number {
    const [inputStart, inputEnd] = inputRange;
    const [outputStart, outputEnd] = outputRange;

    // Clamping the input value to the input range
    const clampedValue = Math.min(Math.max(inputValue, inputStart), inputEnd);

    // Calculating the interpolation factor
    const factor = (clampedValue - inputStart) / (inputEnd - inputStart);

    // Interpolating within the output range and returning the result
    return outputStart + factor * (outputEnd - outputStart);
  }
}
