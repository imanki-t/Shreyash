export interface SplitIndices {
  trainIndices: number[];
  testIndices: number[];
}

export interface HyperparameterGrid {
  [paramName: string]: number[];
}

export interface OptimizationResult {
  bestParams: Record<string, number>;
  bestScore: number;
  trialScores: { params: Record<string, number>; score: number }[];
}

export class LinearCongruentialGenerator {
  private state: number;

  constructor(seed: number = 1337) {
    this.state = seed >>> 0;
  }

  public next(): number {
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    return this.state / 4294967296;
  }

  public shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }
}

export class TrainTestSplitter {
  public static split(
    totalCount: number,
    testRatio: number = 0.2,
    seed: number = 42
  ): SplitIndices {
    const rng = new LinearCongruentialGenerator(seed);
    const indices = Array.from({ length: totalCount }, (_, i) => i);
    const shuffled = rng.shuffle(indices);

    const testSize = Math.floor(totalCount * testRatio);
    const testIndices = shuffled.slice(0, testSize);
    const trainIndices = shuffled.slice(testSize);

    return { trainIndices, testIndices };
  }
}

export class KFoldSplitter {
  private k: number;
  private seed: number;

  constructor(k: number = 5, seed: number = 42) {
    this.k = Math.max(2, k);
    this.seed = seed;
  }

  public split(totalCount: number): SplitIndices[] {
    const rng = new LinearCongruentialGenerator(this.seed);
    const indices = Array.from({ length: totalCount }, (_, i) => i);
    const shuffled = rng.shuffle(indices);

    const folds: number[][] = [];
    for (let i = 0; i < this.k; i++) {
      folds.push([]);
    }

    for (let i = 0; i < shuffled.length; i++) {
      folds[i % this.k].push(shuffled[i]);
    }

    const splits: SplitIndices[] = [];
    for (let i = 0; i < this.k; i++) {
      const testIndices = folds[i];
      const trainIndices: number[] = [];

      for (let j = 0; j < this.k; j++) {
        if (j !== i) {
          trainIndices.push(...folds[j]);
        }
      }

      splits.push({ trainIndices, testIndices });
    }

    return splits;
  }
}

export class StratifiedKFoldSplitter {
  private k: number;
  private seed: number;

  constructor(k: number = 5, seed: number = 42) {
    this.k = Math.max(2, k);
    this.seed = seed;
  }

  public split(labels: (string | number)[]): SplitIndices[] {
    const rng = new LinearCongruentialGenerator(this.seed);
    const labelGroups = new Map<string | number, number[]>();

    for (let i = 0; i < labels.length; i++) {
      const l = labels[i];
      if (!labelGroups.has(l)) {
        labelGroups.set(l, []);
      }
      labelGroups.get(l)!.push(i);
    }

    const folds: number[][] = [];
    for (let i = 0; i < this.k; i++) {
      folds.push([]);
    }

    for (const group of labelGroups.values()) {
      const shuffledGroup = rng.shuffle(group);
      for (let i = 0; i < shuffledGroup.length; i++) {
        folds[i % this.k].push(shuffledGroup[i]);
      }
    }

    const splits: SplitIndices[] = [];
    for (let i = 0; i < this.k; i++) {
      const testIndices = folds[i];
      const trainIndices: number[] = [];

      for (let j = 0; j < this.k; j++) {
        if (j !== i) {
          trainIndices.push(...folds[j]);
        }
      }

      splits.push({ trainIndices, testIndices });
    }

    return splits;
  }
}

export class GridSearchOptimizer {
  private static cartesianProduct(paramGrid: HyperparameterGrid): Record<string, number>[] {
    const keys = Object.keys(paramGrid);
    if (keys.length === 0) return [{}];

    let combinations: Record<string, number>[] = [{}];

    for (const key of keys) {
      const values = paramGrid[key];
      const nextCombos: Record<string, number>[] = [];

      for (const combo of combinations) {
        for (const val of values) {
          nextCombos.push({ ...combo, [key]: val });
        }
      }

      combinations = nextCombos;
    }

    return combinations;
  }

  public static optimize(
    paramGrid: HyperparameterGrid,
    evaluateFn: (params: Record<string, number>) => number
  ): OptimizationResult {
    const combinations = GridSearchOptimizer.cartesianProduct(paramGrid);
    let bestScore = -Infinity;
    let bestParams: Record<string, number> = {};
    const trialScores: { params: Record<string, number>; score: number }[] = [];

    for (const params of combinations) {
      const score = evaluateFn(params);
      trialScores.push({ params, score });

      if (score > bestScore) {
        bestScore = score;
        bestParams = { ...params };
      }
    }

    return {
      bestParams,
      bestScore,
      trialScores,
    };
  }
}

export class PrecisionRecallEvaluator {
  public static computePRCurve(
    scores: number[],
    binaryTargets: number[],
    numThresholds: number = 20
  ): { precision: number[]; recall: number[]; thresholds: number[]; aucPR: number } {
    const precisions: number[] = [];
    const recalls: number[] = [];
    const thresholds: number[] = [];

    let totalPositives = 0;
    for (const t of binaryTargets) {
      if (t === 1) totalPositives++;
    }

    if (totalPositives === 0) {
      return { precision: [0], recall: [0], thresholds: [0], aucPR: 0 };
    }

    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const step = (maxScore - minScore) / numThresholds;

    for (let i = 0; i <= numThresholds; i++) {
      const th = minScore + i * step;
      thresholds.push(th);

      let tp = 0;
      let fp = 0;

      for (let s = 0; s < scores.length; s++) {
        const pred = scores[s] >= th ? 1 : 0;
        if (pred === 1 && binaryTargets[s] === 1) tp++;
        if (pred === 1 && binaryTargets[s] === 0) fp++;
      }

      const prec = tp + fp > 0 ? tp / (tp + fp) : 1.0;
      const rec = tp / totalPositives;

      precisions.push(prec);
      recalls.push(rec);
    }

    let auc = 0;
    for (let i = 0; i < recalls.length - 1; i++) {
      const deltaRecall = Math.abs(recalls[i] - recalls[i + 1]);
      const avgPrec = (precisions[i] + precisions[i + 1]) / 2;
      auc += deltaRecall * avgPrec;
    }

    return {
      precision: precisions,
      recall: recalls,
      thresholds,
      aucPR: auc,
    };
  }
}
