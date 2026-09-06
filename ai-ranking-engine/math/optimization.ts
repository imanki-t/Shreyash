import { Matrix, Vector } from "../core/types";
import { MatrixOperations, VectorOperations } from "./linear_algebra";

export class OptimizationEngine {
  public static sgd(
    weights: Float64Array,
    gradients: Float64Array,
    learningRate: number,
    weightDecay: number = 0
  ): void {
    for (let i = 0; i < weights.length; i++) {
      const decay = weightDecay * weights[i];
      weights[i] -= learningRate * (gradients[i] + decay);
    }
  }

  public static momentum(
    weights: Float64Array,
    velocity: Float64Array,
    gradients: Float64Array,
    learningRate: number,
    momentumFactor: number = 0.9,
    weightDecay: number = 0
  ): void {
    for (let i = 0; i < weights.length; i++) {
      const g = gradients[i] + weightDecay * weights[i];
      velocity[i] = momentumFactor * velocity[i] + learningRate * g;
      weights[i] -= velocity[i];
    }
  }

  public static adam(
    weights: Float64Array,
    m: Float64Array,
    v: Float64Array,
    gradients: Float64Array,
    timeStep: number,
    learningRate: number = 0.001,
    beta1: number = 0.9,
    beta2: number = 0.999,
    eps: number = 1e-8,
    weightDecay: number = 0.0001
  ): void {
    const beta1Correction = 1.0 - Math.pow(beta1, timeStep);
    const beta2Correction = 1.0 - Math.pow(beta2, timeStep);

    for (let i = 0; i < weights.length; i++) {
      const g = gradients[i] + weightDecay * weights[i];
      m[i] = beta1 * m[i] + (1.0 - beta1) * g;
      v[i] = beta2 * v[i] + (1.0 - beta2) * g * g;

      const mHat = m[i] / beta1Correction;
      const vHat = v[i] / beta2Correction;

      weights[i] -= (learningRate * mHat) / (Math.sqrt(vHat) + eps);
    }
  }

  public static rmsprop(
    weights: Float64Array,
    squaredAvg: Float64Array,
    gradients: Float64Array,
    learningRate: number = 0.001,
    decayRate: number = 0.9,
    eps: number = 1e-8
  ): void {
    for (let i = 0; i < weights.length; i++) {
      const g = gradients[i];
      squaredAvg[i] = decayRate * squaredAvg[i] + (1.0 - decayRate) * g * g;
      weights[i] -= (learningRate * g) / (Math.sqrt(squaredAvg[i]) + eps);
    }
  }

  public static cosineAnnealingLR(
    initialLR: number,
    minLR: number,
    currentEpoch: number,
    totalEpochs: number
  ): number {
    const progress = Math.min(1.0, currentEpoch / totalEpochs);
    return minLR + 0.5 * (initialLR - minLR) * (1.0 + Math.cos(Math.PI * progress));
  }

  public static polynomialDecayLR(
    initialLR: number,
    endLR: number,
    currentStep: number,
    maxSteps: number,
    power: number = 1.0
  ): number {
    if (currentStep >= maxSteps) return endLR;
    const factor = Math.pow(1.0 - currentStep / maxSteps, power);
    return (initialLR - endLR) * factor + endLR;
  }

  public static clipGradients(gradients: Float64Array, maxNorm: number = 5.0): number {
    let normSq = 0;
    for (let i = 0; i < gradients.length; i++) {
      normSq += gradients[i] * gradients[i];
    }
    const norm = Math.sqrt(normSq);
    if (norm > maxNorm) {
      const scale = maxNorm / norm;
      for (let i = 0; i < gradients.length; i++) {
        gradients[i] *= scale;
      }
    }
    return norm;
  }
}
