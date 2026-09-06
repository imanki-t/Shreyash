import { PostInput } from "../core/types";
import { StatisticalDistributions } from "../math/statistics";

export class BayesianCredibilityScorer {
  private priorAlpha: number;
  private priorBeta: number;

  constructor(priorAlpha: number = 2.0, priorBeta: number = 2.0) {
    this.priorAlpha = priorAlpha;
    this.priorBeta = priorBeta;
  }

  public computeCredibility(post: PostInput): { expectedScore: number; variance: number; lowerBound: number } {
    const verified = post.stamps.verifiedAccurate || 0;
    const corroborated = post.stamps.corroborated || 0;
    const flagged = post.stamps.flaggedAnomaly || 0;
    const discrepancies = post.stamps.discrepancyDetected || 0;

    const positiveEvidence = verified * 2.0 + corroborated * 1.0;
    const negativeEvidence = flagged * 1.5 + discrepancies * 2.5;

    const posteriorAlpha = this.priorAlpha + positiveEvidence;
    const posteriorBeta = this.priorBeta + negativeEvidence;

    const expectedScore = StatisticalDistributions.betaExpectation(posteriorAlpha, posteriorBeta);
    const variance = StatisticalDistributions.betaVariance(posteriorAlpha, posteriorBeta);

    const stdDev = Math.sqrt(variance);
    const lowerBound = Math.max(0, expectedScore - 1.645 * stdDev);

    return {
      expectedScore,
      variance,
      lowerBound,
    };
  }

  public computeControversy(post: PostInput): number {
    const verified = post.stamps.verifiedAccurate || 0;
    const corroborated = post.stamps.corroborated || 0;
    const flagged = post.stamps.flaggedAnomaly || 0;
    const discrepancies = post.stamps.discrepancyDetected || 0;

    const positive = verified + corroborated;
    const negative = flagged + discrepancies;
    const total = positive + negative;

    if (total < 2) {
      return 0;
    }

    const balance = 1.0 - Math.abs(positive - negative) / total;
    const magnitude = Math.log10(total + 1) / 2.0;
    return Math.min(1.0, balance * magnitude);
  }
}
