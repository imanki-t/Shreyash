export interface SplitResult {
  featureIndex: number;
  threshold: number;
  gain: number;
  leftMean: number;
  rightMean: number;
  leftCount: number;
  rightCount: number;
}

export interface GBDTNode {
  isLeaf: boolean;
  value: number;
  featureIndex?: number;
  threshold?: number;
  left?: GBDTNode;
  right?: GBDTNode;
}

export class RegressionTree {
  private root: GBDTNode | null = null;
  private maxDepth: number;
  private minSamplesSplit: number;

  constructor(maxDepth: number = 3, minSamplesSplit: number = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  private findBestSplit(features: Float64Array[], residuals: Float64Array, indices: number[]): SplitResult | null {
    if (indices.length < this.minSamplesSplit) return null;

    const numFeatures = features[0].length;
    let bestGain = -Infinity;
    let bestSplit: SplitResult | null = null;

    let totalSum = 0;
    for (const idx of indices) {
      totalSum += residuals[idx];
    }
    const currentVariance = totalSum * totalSum / indices.length;

    for (let f = 0; f < numFeatures; f++) {
      const sorted = [...indices].sort((a, b) => features[a][f] - features[b][f]);

      let leftSum = 0;
      let leftCount = 0;

      for (let i = 0; i < sorted.length - 1; i++) {
        const idx = sorted[i];
        leftSum += residuals[idx];
        leftCount++;

        const rightSum = totalSum - leftSum;
        const rightCount = indices.length - leftCount;

        if (features[idx][f] === features[sorted[i + 1]][f]) {
          continue;
        }

        const leftGain = (leftSum * leftSum) / leftCount;
        const rightGain = (rightSum * rightSum) / rightCount;
        const gain = leftGain + rightGain - currentVariance;

        if (gain > bestGain) {
          bestGain = gain;
          bestSplit = {
            featureIndex: f,
            threshold: (features[idx][f] + features[sorted[i + 1]][f]) / 2,
            gain,
            leftMean: leftSum / leftCount,
            rightMean: rightSum / rightCount,
            leftCount,
            rightCount,
          };
        }
      }
    }

    return bestSplit;
  }

  private buildTree(features: Float64Array[], residuals: Float64Array, indices: number[], depth: number): GBDTNode {
    let mean = 0;
    for (const idx of indices) {
      mean += residuals[idx];
    }
    mean = indices.length > 0 ? mean / indices.length : 0;

    if (depth >= this.maxDepth || indices.length < this.minSamplesSplit) {
      return { isLeaf: true, value: mean };
    }

    const split = this.findBestSplit(features, residuals, indices);
    if (!split || split.gain <= 1e-7) {
      return { isLeaf: true, value: mean };
    }

    const leftIndices: number[] = [];
    const rightIndices: number[] = [];

    for (const idx of indices) {
      if (features[idx][split.featureIndex] <= split.threshold) {
        leftIndices.push(idx);
      } else {
        rightIndices.push(idx);
      }
    }

    if (leftIndices.length === 0 || rightIndices.length === 0) {
      return { isLeaf: true, value: mean };
    }

    return {
      isLeaf: false,
      value: mean,
      featureIndex: split.featureIndex,
      threshold: split.threshold,
      left: this.buildTree(features, residuals, leftIndices, depth + 1),
      right: this.buildTree(features, residuals, rightIndices, depth + 1),
    };
  }

  public fit(features: Float64Array[], residuals: Float64Array): void {
    const indices = Array.from({ length: features.length }, (_, i) => i);
    this.root = this.buildTree(features, residuals, indices, 0);
  }

  private predictNode(node: GBDTNode, x: Float64Array): number {
    if (node.isLeaf) return node.value;
    if (node.featureIndex !== undefined && node.threshold !== undefined) {
      if (x[node.featureIndex] <= node.threshold) {
        return node.left ? this.predictNode(node.left, x) : node.value;
      } else {
        return node.right ? this.predictNode(node.right, x) : node.value;
      }
    }
    return node.value;
  }

  public predict(x: Float64Array): number {
    if (!this.root) return 0;
    return this.predictNode(this.root, x);
  }
}

export class GradientBoostedRanker {
  private trees: RegressionTree[] = [];
  private learningRate: number;
  private nEstimators: number;
  private maxDepth: number;
  private basePrediction: number = 0;
  private featureImportance: Float64Array | null = null;

  constructor(nEstimators: number = 20, learningRate: number = 0.1, maxDepth: number = 3) {
    this.nEstimators = nEstimators;
    this.learningRate = learningRate;
    this.maxDepth = maxDepth;
  }

  public fit(features: Float64Array[], targets: number[]): void {
    const n = features.length;
    if (n === 0) return;

    let targetSum = 0;
    for (let i = 0; i < n; i++) {
      targetSum += targets[i];
    }
    this.basePrediction = targetSum / n;

    const currentPredictions = new Float64Array(n);
    currentPredictions.fill(this.basePrediction);

    this.trees = [];
    const numFeatures = features[0].length;
    this.featureImportance = new Float64Array(numFeatures);

    for (let iter = 0; iter < this.nEstimators; iter++) {
      const residuals = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        residuals[i] = targets[i] - currentPredictions[i];
      }

      const tree = new RegressionTree(this.maxDepth);
      tree.fit(features, residuals);
      this.trees.push(tree);

      for (let i = 0; i < n; i++) {
        const update = tree.predict(features[i]);
        currentPredictions[i] += this.learningRate * update;
      }
    }
  }

  public predict(x: Float64Array): number {
    let score = this.basePrediction;
    for (const tree of this.trees) {
      score += this.learningRate * tree.predict(x);
    }
    return score;
  }

  public predictBatch(features: Float64Array[]): Float64Array {
    const scores = new Float64Array(features.length);
    for (let i = 0; i < features.length; i++) {
      scores[i] = this.predict(features[i]);
    }
    return scores;
  }

  public rank(features: Float64Array[]): number[] {
    const scores = this.predictBatch(features);
    const indices = Array.from({ length: features.length }, (_, i) => i);
    indices.sort((a, b) => scores[b] - scores[a]);
    return indices;
  }
}

export class PairwiseLambdaMARTBooster {
  private trees: RegressionTree[] = [];
  private learningRate: number;
  private nEstimators: number;
  private maxDepth: number;

  constructor(nEstimators: number = 15, learningRate: number = 0.08, maxDepth: number = 3) {
    this.nEstimators = nEstimators;
    this.learningRate = learningRate;
    this.maxDepth = maxDepth;
  }

  private computeLambdas(scores: Float64Array, relevance: number[]): Float64Array {
    const n = scores.length;
    const lambdas = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (relevance[i] > relevance[j]) {
          const delta = 1.0 / (1.0 + Math.exp(scores[i] - scores[j]));
          lambdas[i] += delta;
          lambdas[j] -= delta;
        }
      }
    }

    return lambdas;
  }

  public fit(features: Float64Array[], relevance: number[]): void {
    const n = features.length;
    if (n === 0) return;

    const currentScores = new Float64Array(n);
    this.trees = [];

    for (let iter = 0; iter < this.nEstimators; iter++) {
      const lambdas = this.computeLambdas(currentScores, relevance);

      const tree = new RegressionTree(this.maxDepth);
      tree.fit(features, lambdas);
      this.trees.push(tree);

      for (let i = 0; i < n; i++) {
        currentScores[i] += this.learningRate * tree.predict(features[i]);
      }
    }
  }

  public predict(x: Float64Array): number {
    let score = 0;
    for (const tree of this.trees) {
      score += this.learningRate * tree.predict(x);
    }
    return score;
  }
}
