import { RankingScore, EvaluationResult } from "../core/types";

export class RankingEvaluator {
  public static dcg(relevanceScores: number[], k: number): number {
    let dcgVal = 0;
    const limit = Math.min(relevanceScores.length, k);
    for (let i = 0; i < limit; i++) {
      const rel = relevanceScores[i];
      const rank = i + 1;
      dcgVal += (Math.pow(2, rel) - 1) / (Math.log2(rank + 1));
    }
    return dcgVal;
  }

  public static ndcg(predictedScores: number[], idealScores: number[], k: number): number {
    const actualDcg = RankingEvaluator.dcg(predictedScores, k);
    const idealDcg = RankingEvaluator.dcg(idealScores, k);
    if (idealDcg === 0) {
      return actualDcg > 0 ? 1.0 : 0.0;
    }
    return actualDcg / idealDcg;
  }

  public static meanReciprocalRank(rankedRelevantFlags: boolean[]): number {
    for (let i = 0; i < rankedRelevantFlags.length; i++) {
      if (rankedRelevantFlags[i]) {
        return 1.0 / (i + 1);
      }
    }
    return 0;
  }

  public static precisionAtK(rankedRelevantFlags: boolean[], k: number): number {
    if (k <= 0) return 0;
    const limit = Math.min(rankedRelevantFlags.length, k);
    let truePositives = 0;
    for (let i = 0; i < limit; i++) {
      if (rankedRelevantFlags[i]) {
        truePositives += 1;
      }
    }
    return truePositives / k;
  }

  public static maximalMarginalRelevance(
    candidates: RankingScore[],
    similarityMatrix: number[][],
    lambda: number = 0.7,
    topK: number = 10
  ): RankingScore[] {
    if (candidates.length === 0) return [];
    const selected: RankingScore[] = [];
    const selectedIndices: Set<number> = new Set();

    while (selected.length < Math.min(candidates.length, topK)) {
      let bestScore = -Infinity;
      let bestIndex = -1;

      for (let i = 0; i < candidates.length; i++) {
        if (selectedIndices.has(i)) continue;

        const candidateScore = candidates[i].finalScore;
        let maxSim = 0;

        for (const sIdx of Array.from(selectedIndices)) {
          const sim = similarityMatrix[i][sIdx] || 0;
          if (sim > maxSim) {
            maxSim = sim;
          }
        }

        const mmr = lambda * candidateScore - (1.0 - lambda) * maxSim;
        if (mmr > bestScore) {
          bestScore = mmr;
          bestIndex = i;
        }
      }

      if (bestIndex >= 0) {
        selectedIndices.add(bestIndex);
        selected.push({
          ...candidates[bestIndex],
          rank: selected.length + 1,
          diversityPenalty: 1.0 - lambda,
        });
      } else {
        break;
      }
    }

    return selected;
  }
}
