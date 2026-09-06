export interface SplitCriterion {
  featureIndex: number;
  threshold: number;
  gain: number;
}

export class TreeNode {
  public featureIndex: number;
  public threshold: number;
  public left: TreeNode | null;
  public right: TreeNode | null;
  public value: number;
  public isLeaf: boolean;

  constructor(value: number = 0, isLeaf: boolean = true) {
    this.featureIndex = -1;
    this.threshold = 0;
    this.left = null;
    this.right = null;
    this.value = value;
    this.isLeaf = isLeaf;
  }
}

export class GradientBoostedRankingTree {
  private root: TreeNode | null;
  private maxDepth: number;
  private minSamplesSplit: number;

  constructor(maxDepth: number = 4, minSamplesSplit: number = 3) {
    this.root = null;
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  public fit(features: Float64Array[], targets: number[]): void {
    this.root = this.buildTree(features, targets, 0);
  }

  private buildTree(features: Float64Array[], targets: number[], depth: number): TreeNode {
    const nSamples = features.length;
    if (nSamples === 0) {
      return new TreeNode(0, true);
    }

    let sum = 0;
    for (let i = 0; i < nSamples; i++) {
      sum += targets[i];
    }
    const meanVal = sum / nSamples;

    if (depth >= this.maxDepth || nSamples < this.minSamplesSplit) {
      return new TreeNode(meanVal, true);
    }

    const split = this.findBestSplit(features, targets);
    if (!split || split.gain <= 1e-7) {
      return new TreeNode(meanVal, true);
    }

    const leftFeatures: Float64Array[] = [];
    const leftTargets: number[] = [];
    const rightFeatures: Float64Array[] = [];
    const rightTargets: number[] = [];

    for (let i = 0; i < nSamples; i++) {
      if (features[i][split.featureIndex] <= split.threshold) {
        leftFeatures.push(features[i]);
        leftTargets.push(targets[i]);
      } else {
        rightFeatures.push(features[i]);
        rightTargets.push(targets[i]);
      }
    }

    const node = new TreeNode(meanVal, false);
    node.featureIndex = split.featureIndex;
    node.threshold = split.threshold;
    node.left = this.buildTree(leftFeatures, leftTargets, depth + 1);
    node.right = this.buildTree(rightFeatures, rightTargets, depth + 1);

    return node;
  }

  private findBestSplit(features: Float64Array[], targets: number[]): SplitCriterion | null {
    const nSamples = features.length;
    const nFeatures = features[0].length;
    let bestGain = -Infinity;
    let bestFeature = -1;
    let bestThreshold = 0;

    let totalSum = 0;
    for (let i = 0; i < nSamples; i++) {
      totalSum += targets[i];
    }

    for (let f = 0; f < nFeatures; f++) {
      const values = features.map((x, idx) => ({ val: x[f], target: targets[idx] }));
      values.sort((a, b) => a.val - b.val);

      let leftSum = 0;
      let leftCount = 0;

      for (let i = 0; i < nSamples - 1; i++) {
        leftSum += values[i].target;
        leftCount += 1;
        const rightCount = nSamples - leftCount;
        const rightSum = totalSum - leftSum;

        if (values[i].val === values[i + 1].val) continue;

        const gain = (leftSum * leftSum) / leftCount + (rightSum * rightSum) / rightCount;
        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = f;
          bestThreshold = (values[i].val + values[i + 1].val) / 2.0;
        }
      }
    }

    if (bestFeature === -1) return null;
    return {
      featureIndex: bestFeature,
      threshold: bestThreshold,
      gain: bestGain,
    };
  }

  public predictOne(vector: Float64Array): number {
    let curr = this.root;
    while (curr && !curr.isLeaf) {
      if (vector[curr.featureIndex] <= curr.threshold) {
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }
    return curr ? curr.value : 0;
  }

  public predictBatch(vectors: Float64Array[]): number[] {
    return vectors.map((v) => this.predictOne(v));
  }
}
