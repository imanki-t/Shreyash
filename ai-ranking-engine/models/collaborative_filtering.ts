export interface Interaction {
  userId: string;
  itemId: string;
  weight: number;
  timestamp: number;
}

export interface RecommendationResult {
  itemId: string;
  predictedScore: number;
  explanation: string;
}

export class SparseInteractionMatrix {
  private userItemMap: Map<string, Map<string, number>> = new Map();
  private itemUserMap: Map<string, Map<string, number>> = new Map();
  private allUsers: Set<string> = new Set();
  private allItems: Set<string> = new Set();

  public addInteraction(userId: string, itemId: string, weight: number): void {
    this.allUsers.add(userId);
    this.allItems.add(itemId);

    if (!this.userItemMap.has(userId)) {
      this.userItemMap.set(userId, new Map());
    }
    const currentWeight = this.userItemMap.get(userId)!.get(itemId) || 0;
    this.userItemMap.get(userId)!.set(itemId, currentWeight + weight);

    if (!this.itemUserMap.has(itemId)) {
      this.itemUserMap.set(itemId, new Map());
    }
    this.itemUserMap.get(itemId)!.set(userId, currentWeight + weight);
  }

  public getUserInteractions(userId: string): Map<string, number> {
    return this.userItemMap.get(userId) || new Map();
  }

  public getItemInteractions(itemId: string): Map<string, number> {
    return this.itemUserMap.get(itemId) || new Map();
  }

  public getUsers(): string[] {
    return Array.from(this.allUsers);
  }

  public getItems(): string[] {
    return Array.from(this.allItems);
  }
}

export class ItemItemCollaborativeFilter {
  private matrix: SparseInteractionMatrix;
  private similarityCache: Map<string, Map<string, number>> = new Map();

  constructor(matrix: SparseInteractionMatrix) {
    this.matrix = matrix;
  }

  public computeItemSimilarity(itemA: string, itemB: string): number {
    if (itemA === itemB) return 1.0;

    const usersA = this.matrix.getItemInteractions(itemA);
    const usersB = this.matrix.getItemInteractions(itemB);

    if (usersA.size === 0 || usersB.size === 0) return 0.0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (const [user, valA] of usersA.entries()) {
      normA += valA * valA;
      const valB = usersB.get(user);
      if (valB !== undefined) {
        dot += valA * valB;
      }
    }

    for (const valB of usersB.values()) {
      normB += valB * valB;
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 0 ? dot / denom : 0.0;
  }

  public precomputeSimilarities(kNeighbors: number = 20): void {
    this.similarityCache.clear();
    const items = this.matrix.getItems();

    for (let i = 0; i < items.length; i++) {
      const itemA = items[i];
      const simList: { item: string; sim: number }[] = [];

      for (let j = 0; j < items.length; j++) {
        if (i === j) continue;
        const itemB = items[j];
        const sim = this.computeItemSimilarity(itemA, itemB);
        if (sim > 0.01) {
          simList.push({ item: itemB, sim });
        }
      }

      simList.sort((a, b) => b.sim - a.sim);
      const topK = simList.slice(0, kNeighbors);

      const simMap = new Map<string, number>();
      for (const entry of topK) {
        simMap.set(entry.item, entry.sim);
      }
      this.similarityCache.set(itemA, simMap);
    }
  }

  public predictUserScore(userId: string, targetItemId: string): number {
    const userInteractions = this.matrix.getUserInteractions(userId);
    if (userInteractions.size === 0) return 0;

    let simSum = 0;
    let weightedScoreSum = 0;

    const cachedNeighbors = this.similarityCache.get(targetItemId);

    for (const [ratedItem, weight] of userInteractions.entries()) {
      if (ratedItem === targetItemId) continue;

      let sim = 0;
      if (cachedNeighbors && cachedNeighbors.has(ratedItem)) {
        sim = cachedNeighbors.get(ratedItem)!;
      } else {
        sim = this.computeItemSimilarity(targetItemId, ratedItem);
      }

      if (sim > 0) {
        weightedScoreSum += sim * weight;
        simSum += Math.abs(sim);
      }
    }

    return simSum > 0 ? weightedScoreSum / simSum : 0;
  }

  public recommendForUser(userId: string, topN: number = 10): RecommendationResult[] {
    const userInteractions = this.matrix.getUserInteractions(userId);
    const candidateItems = this.matrix.getItems().filter((item) => !userInteractions.has(item));
    const recommendations: RecommendationResult[] = [];

    for (const candidate of candidateItems) {
      const predictedScore = this.predictUserScore(userId, candidate);
      if (predictedScore > 0) {
        recommendations.push({
          itemId: candidate,
          predictedScore,
          explanation: "collaborative_item_similarity",
        });
      }
    }

    recommendations.sort((a, b) => b.predictedScore - a.predictedScore);
    return recommendations.slice(0, topN);
  }
}

export class AlternatingLeastSquaresImplicit {
  private numFactors: number;
  private lambda: number;
  private alpha: number;
  private numIterations: number;
  private userFactors: Map<string, Float64Array> = new Map();
  private itemFactors: Map<string, Float64Array> = new Map();

  constructor(numFactors: number = 8, lambda: number = 0.05, alpha: number = 40.0, numIterations: number = 10) {
    this.numFactors = numFactors;
    this.lambda = lambda;
    this.alpha = alpha;
    this.numIterations = numIterations;
  }

  private randomVector(dim: number): Float64Array {
    const vec = new Float64Array(dim);
    for (let i = 0; i < dim; i++) {
      vec[i] = (Math.random() - 0.5) * 0.1;
    }
    return vec;
  }

  public fit(matrix: SparseInteractionMatrix): void {
    const users = matrix.getUsers();
    const items = matrix.getItems();

    for (const u of users) {
      this.userFactors.set(u, this.randomVector(this.numFactors));
    }
    for (const it of items) {
      this.itemFactors.set(it, this.randomVector(this.numFactors));
    }

    const f = this.numFactors;

    for (let iter = 0; iter < this.numIterations; iter++) {
      for (const u of users) {
        const interactions = matrix.getUserInteractions(u);
        if (interactions.size === 0) continue;

        const uVec = this.userFactors.get(u)!;
        for (let d = 0; d < f; d++) {
          let num = 0;
          let denom = this.lambda;

          for (const [it, r_ui] of interactions.entries()) {
            const iVec = this.itemFactors.get(it);
            if (!iVec) continue;

            const c_ui = 1.0 + this.alpha * r_ui;
            denom += c_ui * iVec[d] * iVec[d];

            let dotWithoutD = 0;
            for (let k = 0; k < f; k++) {
              if (k !== d) {
                dotWithoutD += uVec[k] * iVec[k];
              }
            }
            num += c_ui * (1.0 - dotWithoutD) * iVec[d];
          }

          if (denom > 1e-10) {
            uVec[d] = num / denom;
          }
        }
      }

      for (const it of items) {
        const interactions = matrix.getItemInteractions(it);
        if (interactions.size === 0) continue;

        const iVec = this.itemFactors.get(it)!;
        for (let d = 0; d < f; d++) {
          let num = 0;
          let denom = this.lambda;

          for (const [u, r_ui] of interactions.entries()) {
            const uVec = this.userFactors.get(u);
            if (!uVec) continue;

            const c_ui = 1.0 + this.alpha * r_ui;
            denom += c_ui * uVec[d] * uVec[d];

            let dotWithoutD = 0;
            for (let k = 0; k < f; k++) {
              if (k !== d) {
                dotWithoutD += uVec[k] * iVec[k];
              }
            }
            num += c_ui * (1.0 - dotWithoutD) * uVec[d];
          }

          if (denom > 1e-10) {
            iVec[d] = num / denom;
          }
        }
      }
    }
  }

  public predict(userId: string, itemId: string): number {
    const uVec = this.userFactors.get(userId);
    const iVec = this.itemFactors.get(itemId);
    if (!uVec || !iVec) return 0;

    let dot = 0;
    for (let d = 0; d < this.numFactors; d++) {
      dot += uVec[d] * iVec[d];
    }
    return 1.0 / (1.0 + Math.exp(-dot));
  }
}
