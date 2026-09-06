import { Vector, Matrix } from "../core/types";

export interface LossEvaluation {
  loss: number;
  gradient: Float64Array;
}

export class RankNetLoss {
  private sigma: number;

  constructor(sigma: number = 1.0) {
    this.sigma = sigma;
  }

  public computePairwise(scoreI: number, scoreJ: number, target: number): { loss: number; gradI: number; gradJ: number } {
    const sDiff = this.sigma * (scoreI - scoreJ);
    const expNeg = Math.exp(-sDiff);
    const prob = 1.0 / (1.0 + expNeg);

    let loss = 0;
    if (target === 1) {
      loss = Math.log(1.0 + Math.exp(-sDiff));
    } else if (target === -1) {
      loss = Math.log(1.0 + Math.exp(sDiff));
    } else {
      loss = 0.5 * (1.0 - target) * sDiff + Math.log(1.0 + Math.exp(-sDiff));
    }

    const lambda = this.sigma * (0.5 * (1 - target) - 1.0 / (1.0 + Math.exp(sDiff)));

    return {
      loss,
      gradI: lambda,
      gradJ: -lambda,
    };
  }

  public computeBatch(scores: Float64Array, relevanceLabels: number[]): LossEvaluation {
    const n = scores.length;
    const gradient = new Float64Array(n);
    let totalLoss = 0;
    let pairsCount = 0;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        if (relevanceLabels[i] > relevanceLabels[j]) {
          const res = this.computePairwise(scores[i], scores[j], 1.0);
          totalLoss += res.loss;
          gradient[i] += res.gradI;
          gradient[j] += res.gradJ;
          pairsCount++;
        }
      }
    }

    if (pairsCount > 0) {
      totalLoss /= pairsCount;
      for (let k = 0; k < n; k++) {
        gradient[k] /= pairsCount;
      }
    }

    return { loss: totalLoss, gradient };
  }
}

export class ListNetLoss {
  private temperature: number;

  constructor(temperature: number = 1.0) {
    this.temperature = temperature;
  }

  private softmax(arr: Float64Array | number[]): Float64Array {
    const n = arr.length;
    const result = new Float64Array(n);
    let maxVal = -Infinity;
    for (let i = 0; i < n; i++) {
      if (arr[i] > maxVal) maxVal = arr[i];
    }

    let sumExp = 0;
    for (let i = 0; i < n; i++) {
      result[i] = Math.exp((arr[i] - maxVal) / this.temperature);
      sumExp += result[i];
    }

    for (let i = 0; i < n; i++) {
      result[i] = sumExp > 0 ? result[i] / sumExp : 1.0 / n;
    }

    return result;
  }

  public compute(predictedScores: Float64Array, groundTruthScores: number[]): LossEvaluation {
    const n = predictedScores.length;
    const predProbs = this.softmax(predictedScores);
    const trueProbs = this.softmax(groundTruthScores);

    let loss = 0;
    const gradient = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      if (trueProbs[i] > 1e-12) {
        loss -= trueProbs[i] * Math.log(Math.max(1e-12, predProbs[i]));
      }
      gradient[i] = (predProbs[i] - trueProbs[i]) / this.temperature;
    }

    return { loss, gradient };
  }
}

export class LambdaMARTGradients {
  public static computeIdealDCG(relevance: number[]): number {
    const sorted = [...relevance].sort((a, b) => b - a);
    let idcg = 0;
    for (let i = 0; i < sorted.length; i++) {
      idcg += (Math.pow(2, sorted[i]) - 1) / Math.log2(i + 2);
    }
    return idcg > 0 ? idcg : 1.0;
  }

  public static computeLambdas(
    scores: Float64Array,
    relevance: number[]
  ): { lambdas: Float64Array; hessians: Float64Array } {
    const n = scores.length;
    const lambdas = new Float64Array(n);
    const hessians = new Float64Array(n);

    const indices = Array.from({ length: n }, (_, i) => i);
    indices.sort((a, b) => scores[b] - scores[a]);

    const ranks = new Int32Array(n);
    for (let rank = 0; rank < n; rank++) {
      ranks[indices[rank]] = rank + 1;
    }

    const idcg = LambdaMARTGradients.computeIdealDCG(relevance);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (relevance[i] <= relevance[j]) continue;

        const rankI = ranks[i];
        const rankJ = ranks[j];

        const gainI = Math.pow(2, relevance[i]) - 1;
        const gainJ = Math.pow(2, relevance[j]) - 1;

        const discountI = 1.0 / Math.log2(rankI + 1);
        const discountJ = 1.0 / Math.log2(rankJ + 1);

        const deltaNDCG = Math.abs((gainI - gainJ) * (discountI - discountJ)) / idcg;

        const rho = 1.0 / (1.0 + Math.exp(scores[i] - scores[j]));
        const lambda = rho * deltaNDCG;
        const hessian = rho * (1.0 - rho) * deltaNDCG;

        lambdas[i] += lambda;
        lambdas[j] -= lambda;
        hessians[i] += hessian;
        hessians[j] += hessian;
      }
    }

    return { lambdas, hessians };
  }
}

export class HingeRankingLoss {
  private margin: number;

  constructor(margin: number = 1.0) {
    this.margin = margin;
  }

  public compute(
    posScores: Float64Array,
    negScores: Float64Array
  ): { loss: number; posGradients: Float64Array; negGradients: Float64Array } {
    const n = Math.min(posScores.length, negScores.length);
    let totalLoss = 0;
    const posGrads = new Float64Array(n);
    const negGrads = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      const diff = this.margin - (posScores[i] - negScores[i]);
      if (diff > 0) {
        totalLoss += diff;
        posGrads[i] = -1.0;
        negGrads[i] = 1.0;
      }
    }

    return {
      loss: n > 0 ? totalLoss / n : 0,
      posGradients: posGrads,
      negGradients: negGrads,
    };
  }
}

export class HuberLoss {
  private delta: number;

  constructor(delta: number = 1.0) {
    this.delta = delta;
  }

  public compute(predicted: Float64Array, target: Float64Array): LossEvaluation {
    const n = predicted.length;
    let totalLoss = 0;
    const gradient = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      const error = predicted[i] - target[i];
      const absError = Math.abs(error);

      if (absError <= this.delta) {
        totalLoss += 0.5 * error * error;
        gradient[i] = error;
      } else {
        totalLoss += this.delta * (absError - 0.5 * this.delta);
        gradient[i] = this.delta * Math.sign(error);
      }
    }

    return {
      loss: n > 0 ? totalLoss / n : 0,
      gradient,
    };
  }
}

export class FocalLoss {
  private gamma: number;
  private alpha: number;

  constructor(gamma: number = 2.0, alpha: number = 0.25) {
    this.gamma = gamma;
    this.alpha = alpha;
  }

  public compute(probabilities: Float64Array, targets: number[]): LossEvaluation {
    const n = probabilities.length;
    let totalLoss = 0;
    const gradient = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      const p = Math.max(1e-15, Math.min(1.0 - 1e-15, probabilities[i]));
      const y = targets[i];

      const pt = y === 1 ? p : 1.0 - p;
      const alphaT = y === 1 ? this.alpha : 1.0 - this.alpha;
      const focalWeight = alphaT * Math.pow(1.0 - pt, this.gamma);

      totalLoss += -focalWeight * Math.log(pt);

      if (y === 1) {
        gradient[i] = -alphaT * Math.pow(1.0 - p, this.gamma - 1) * (this.gamma * p * Math.log(p) + p - 1);
      } else {
        gradient[i] = (1 - this.alpha) * Math.pow(p, this.gamma - 1) * (this.gamma * (1 - p) * Math.log(1 - p) - p);
      }
    }

    return {
      loss: n > 0 ? totalLoss / n : 0,
      gradient,
    };
  }
}

export class TripletMarginLoss {
  private margin: number;

  constructor(margin: number = 0.5) {
    this.margin = margin;
  }

  private l2DistanceSquared(a: Float64Array, b: Float64Array): number {
    let dist = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      dist += diff * diff;
    }
    return dist;
  }

  public compute(anchor: Float64Array, positive: Float64Array, negative: Float64Array): number {
    const posDist = this.l2DistanceSquared(anchor, positive);
    const negDist = this.l2DistanceSquared(anchor, negative);
    return Math.max(0, posDist - negDist + this.margin);
  }
}
