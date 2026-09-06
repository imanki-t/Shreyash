import { PostInput, RankingScore } from "../core/types";

export interface RankedItem {
  id: string;
  score: number;
  rank: number;
}

export class ReciprocalRankFusion {
  private kConstant: number;

  constructor(kConstant: number = 60) {
    this.kConstant = kConstant;
  }

  public fuse(rankingsList: RankedItem[][]): Map<string, number> {
    const fusedScores = new Map<string, number>();

    for (const ranking of rankingsList) {
      for (let rank = 0; rank < ranking.length; rank++) {
        const item = ranking[rank];
        const rrfContribution = 1.0 / (this.kConstant + rank + 1);
        const current = fusedScores.get(item.id) || 0;
        fusedScores.set(item.id, current + rrfContribution);
      }
    }

    return fusedScores;
  }
}

export class BordaCountElect {
  public static elect(rankingsList: RankedItem[][]): Map<string, number> {
    const bordaScores = new Map<string, number>();

    for (const ranking of rankingsList) {
      const n = ranking.length;
      for (let i = 0; i < n; i++) {
        const item = ranking[i];
        const points = n - 1 - i;
        const current = bordaScores.get(item.id) || 0;
        bordaScores.set(item.id, current + points);
      }
    }

    return bordaScores;
  }
}

export class LinearBlendingRanker {
  private weights: number[];

  constructor(weights: number[]) {
    const sum = weights.reduce((acc, val) => acc + val, 0);
    this.weights = sum > 0 ? weights.map((w) => w / sum) : weights;
  }

  public blend(scoreVectors: Map<string, number[]>): Map<string, number> {
    const finalScores = new Map<string, number>();

    for (const [id, scores] of scoreVectors.entries()) {
      let combined = 0;
      for (let i = 0; i < Math.min(scores.length, this.weights.length); i++) {
        combined += scores[i] * this.weights[i];
      }
      finalScores.set(id, combined);
    }

    return finalScores;
  }
}

export class CategoryBalancingFilter {
  private maxPerCategory: number;

  constructor(maxPerCategory: number = 3) {
    this.maxPerCategory = maxPerCategory;
  }

  public balance(posts: RankingScore[], categoryLookup: Map<string, string>): RankingScore[] {
    const counts = new Map<string, number>();
    const selected: RankingScore[] = [];
    const deferred: RankingScore[] = [];

    for (const post of posts) {
      const cat = categoryLookup.get(post.postId) || "general";
      const count = counts.get(cat) || 0;

      if (count < this.maxPerCategory) {
        counts.set(cat, count + 1);
        selected.push(post);
      } else {
        deferred.push(post);
      }
    }

    return [...selected, ...deferred];
  }
}

export class CascadeRankingPipeline {
  private fastFilterThreshold: number;
  private maxCandidatesStage1: number;

  constructor(fastFilterThreshold: number = 0.15, maxCandidatesStage1: number = 100) {
    this.fastFilterThreshold = fastFilterThreshold;
    this.maxCandidatesStage1 = maxCandidatesStage1;
  }

  public stage1HeuristicFilter(posts: PostInput[]): PostInput[] {
    const filtered = posts.filter((p) => {
      const recencyDays = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 3600 * 24);
      const activityScore = (p.stamps.verifiedAccurate + p.stamps.corroborated + p.emojis.thumbsUp) * 0.1;
      const pass = activityScore > 0 || recencyDays < 60 || !p.isRedacted;
      return pass;
    });

    if (filtered.length > this.maxCandidatesStage1) {
      return filtered.slice(0, this.maxCandidatesStage1);
    }
    return filtered;
  }

  public stage2ReRank(
    scores: RankingScore[],
    weights: { neural: number; bayesian: number; recency: number }
  ): RankingScore[] {
    const totalWeight = weights.neural + weights.bayesian + weights.recency;
    const wN = weights.neural / totalWeight;
    const wB = weights.bayesian / totalWeight;
    const wR = weights.recency / totalWeight;

    for (const s of scores) {
      s.finalScore = s.neuralScore * wN + s.bayesianScore * wB + s.recencyScore * wR;
    }

    scores.sort((a, b) => b.finalScore - a.finalScore);
    for (let i = 0; i < scores.length; i++) {
      scores[i].rank = i + 1;
    }

    return scores;
  }
}
