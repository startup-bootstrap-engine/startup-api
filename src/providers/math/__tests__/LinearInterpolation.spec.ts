import { container } from "@providers/inversify/container";
import { LinearInterpolation } from "../LinearInterpolation";

describe("LinearInterpolation", () => {
  let linearInterpolation: LinearInterpolation;

  beforeAll(() => {
    linearInterpolation = container.get(LinearInterpolation);
  });

  describe("calculateLinearInterpolation", () => {
    it("Should correctly calculate default linear interpolation", () => {
      const result = linearInterpolation.calculateLinearInterpolation(50, 1, 100);
      expect(result).toBeCloseTo(50); // Adjust to your expected value
    });

    it("Should correctly calculate reverse linear interpolation", () => {
      const result = linearInterpolation.calculateLinearInterpolation(50, 1, 100, "reverse");
      expect(result).toBeCloseTo(51); // Adjusted to the expected value
    });

    it("Should handle edge case of minimum value", () => {
      const result = linearInterpolation.calculateLinearInterpolation(1, 1, 100);
      expect(result).toBeCloseTo(1); // Adjust to your expected value
    });

    it("Should handle edge case of maximum value", () => {
      const result = linearInterpolation.calculateLinearInterpolation(99, 1, 100);
      expect(result).toBeCloseTo(99); // Adjusted to the expected value
    });
  });

  describe("MultiPoint linear interpolation", () => {
    it("Should interpolate correctly within given range", () => {
      const result = linearInterpolation.calculateMultiPointInterpolation(75, [50, 150], [2.6, 3]);
      expect(result).toBeCloseTo(2.7); // Adjusted to the expected value
    });

    it("Should clamp and interpolate for values below the input range", () => {
      const result = linearInterpolation.calculateMultiPointInterpolation(30, [50, 150], [2.6, 3]);
      expect(result).toBeCloseTo(2.6); // Value should be clamped to the lower bound
    });

    it("Should clamp and interpolate for values above the input range", () => {
      const result = linearInterpolation.calculateMultiPointInterpolation(200, [50, 150], [2.6, 3]);
      expect(result).toBeCloseTo(3); // Value should be clamped to the upper bound
    });

    it("Should handle edge case of minimum input value", () => {
      const result = linearInterpolation.calculateMultiPointInterpolation(50, [50, 150], [2.6, 3]);
      expect(result).toBeCloseTo(2.6);
    });

    it("Should handle edge case of maximum input value", () => {
      const result = linearInterpolation.calculateMultiPointInterpolation(150, [50, 150], [2.6, 3]);
      expect(result).toBeCloseTo(3);
    });
  });
});
