import { Vector } from "../core/types";

export class StatisticalDistributions {
  public static gaussianPdf(x: number, mean: number = 0, stdDev: number = 1): number {
    if (stdDev <= 0) {
      return 0;
    }
    const variance = stdDev * stdDev;
    const factor = 1.0 / Math.sqrt(2 * Math.PI * variance);
    const exponent = -((x - mean) * (x - mean)) / (2 * variance);
    return factor * Math.exp(exponent);
  }

  public static gaussianCdf(x: number, mean: number = 0, stdDev: number = 1): number {
    if (stdDev <= 0) {
      return x >= mean ? 1.0 : 0.0;
    }
    const z = (x - mean) / (stdDev * Math.SQRT2);
    return 0.5 * (1.0 + StatisticalDistributions.errorFunction(z));
  }

  public static errorFunction(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX);
    return sign * y;
  }

  public static logGamma(z: number): number {
    const p = [
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
      9.9843695780195716e-6,
      1.5056327351493116e-7
    ];
    if (z < 0.5) {
      return Math.log(Math.PI / Math.sin(Math.PI * z)) - StatisticalDistributions.logGamma(1 - z);
    }
    z -= 1;
    let x = 0.99999999999980993;
    for (let i = 0; i < p.length; i++) {
      x += p[i] / (z + i + 1);
    }
    const t = z + p.length - 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }

  public static betaPdf(x: number, alpha: number, beta: number): number {
    if (x < 0 || x > 1 || alpha <= 0 || beta <= 0) {
      return 0;
    }
    const logBetaFunc = StatisticalDistributions.logGamma(alpha) + StatisticalDistributions.logGamma(beta) - StatisticalDistributions.logGamma(alpha + beta);
    const logVal = (alpha - 1) * Math.log(Math.max(1e-10, x)) + (beta - 1) * Math.log(Math.max(1e-10, 1 - x)) - logBetaFunc;
    return Math.exp(logVal);
  }

  public static betaExpectation(alpha: number, beta: number): number {
    return alpha / (alpha + beta);
  }

  public static betaVariance(alpha: number, beta: number): number {
    const total = alpha + beta;
    return (alpha * beta) / (total * total * (total + 1));
  }

  public static dirichletExpectation(alphas: number[]): number[] {
    const sumAlphas = alphas.reduce((acc, v) => acc + v, 0);
    if (sumAlphas === 0) {
      return alphas.map(() => 1.0 / alphas.length);
    }
    return alphas.map((a) => a / sumAlphas);
  }

  public static exponentialDecay(initialValue: number, lambdaRate: number, timeElapsed: number): number {
    return initialValue * Math.exp(-lambdaRate * Math.max(0, timeElapsed));
  }

  public static halfLifeLambda(halfLifeHours: number): number {
    return Math.LN2 / Math.max(0.1, halfLifeHours);
  }

  public static wilsonScoreInterval(positive: number, total: number, confidenceZ: number = 1.96): number {
    if (total <= 0) {
      return 0;
    }
    const p = positive / total;
    const zSq = confidenceZ * confidenceZ;
    const denominator = 1.0 + zSq / total;
    const center = p + zSq / (2 * total);
    const margin = confidenceZ * Math.sqrt((p * (1 - p) + zSq / (4 * total)) / total);
    return Math.max(0, (center - margin) / denominator);
  }

  public static mean(values: number[]): number {
    if (values.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
    }
    return sum / values.length;
  }

  public static variance(values: number[]): number {
    if (values.length < 2) return 0;
    const m = StatisticalDistributions.mean(values);
    let sumSq = 0;
    for (let i = 0; i < values.length; i++) {
      const diff = values[i] - m;
      sumSq += diff * diff;
    }
    return sumSq / (values.length - 1);
  }

  public static standardDeviation(values: number[]): number {
    return Math.sqrt(StatisticalDistributions.variance(values));
  }

  public static zScore(value: number, mean: number, stdDev: number): number {
    if (stdDev <= 0) return 0;
    return (value - mean) / stdDev;
  }

  public static pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) {
      return 0;
    }
    const meanX = StatisticalDistributions.mean(x);
    const meanY = StatisticalDistributions.mean(y);
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    for (let i = 0; i < x.length; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      numerator += diffX * diffY;
      denomX += diffX * diffX;
      denomY += diffY * diffY;
    }
    const denom = Math.sqrt(denomX * denomY);
    if (denom === 0) return 0;
    return numerator / denom;
  }
}
