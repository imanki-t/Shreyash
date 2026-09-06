import { PostInput, ExtractedFeatures, FeatureWeights } from "../core/types";
import { StatisticalDistributions } from "../math/statistics";
import { TextTokenizer } from "./tokenizer";

export class FeatureExtractor {
  private tokenizer: TextTokenizer;
  private defaultWeights: FeatureWeights;
  private sentimentLexicon: Map<string, number>;

  constructor() {
    this.tokenizer = new TextTokenizer();
    this.defaultWeights = {
      recencyWeight: 0.22,
      corroborationWeight: 0.25,
      severityWeight: 0.18,
      engagementVelocityWeight: 0.15,
      lexicalRichnessWeight: 0.08,
      mediaRichnessWeight: 0.12,
      discrepancyPenalty: -0.15,
      redactionPenalty: -0.05,
      authorityWeight: 0.10,
    };
    this.sentimentLexicon = new Map<string, number>([
      ["verified", 1.5],
      ["confirmed", 1.4],
      ["accurate", 1.2],
      ["critical", 0.9],
      ["wholesome", 1.8],
      ["loyalty", 1.5],
      ["anomaly", -0.8],
      ["discrepancy", -1.2],
      ["failure", -0.9],
      ["compromised", -1.5],
      ["detonation", -0.5],
      ["unverified", -1.0],
      ["clutch", 1.7],
      ["exemplary", 1.6],
    ]);
  }

  public extractFeatures(post: PostInput, referenceTimeMs: number = Date.now()): ExtractedFeatures {
    const postTimeMs = new Date(post.createdAt).getTime();
    const elapsedHours = Math.max(0.01, (referenceTimeMs - postTimeMs) / (1000 * 3600));

    const halfLifeHours = 72;
    const lambda = StatisticalDistributions.halfLifeLambda(halfLifeHours);
    const recencyScore = StatisticalDistributions.exponentialDecay(1.0, lambda, elapsedHours);

    const verified = post.stamps.verifiedAccurate || 0;
    const corroborated = post.stamps.corroborated || 0;
    const flagged = post.stamps.flaggedAnomaly || 0;
    const discrepancies = post.stamps.discrepancyDetected || 0;
    const totalStamps = verified + corroborated + flagged + discrepancies;

    const positiveEndorsements = verified * 1.5 + corroborated * 1.0;
    const corroborationScore = StatisticalDistributions.wilsonScoreInterval(
      positiveEndorsements,
      Math.max(1, totalStamps + 1)
    );

    const discrepancyRatio = totalStamps > 0 ? discrepancies / totalStamps : 0;
    const anomalyRatio = totalStamps > 0 ? flagged / totalStamps : 0;

    const totalReactions =
      (post.emojis.thumbsUp || 0) +
      (post.emojis.thumbsDown || 0) +
      (post.emojis.laugh || 0) +
      (post.emojis.skull || 0) +
      (post.emojis.heart || 0) +
      totalStamps;

    const engagementVelocity = totalReactions / Math.sqrt(elapsedHours + 1);

    const severityRating = (post.ratings.average || 0) / 5.0;
    const ratingConfidence = Math.min(1.0, (post.ratings.count || 0) / 10.0);
    const bayesianSeverity = severityRating * ratingConfidence + 0.5 * (1.0 - ratingConfidence);

    let mediaScore = 0;
    if (post.hasVideo) mediaScore += 0.5;
    if (post.hasAudio) mediaScore += 0.35;
    if (post.hasImage) mediaScore += 0.25;
    mediaScore = Math.min(1.0, mediaScore + (post.attachmentsCount || 0) * 0.1);

    const tokens = this.tokenizer.tokenize(post.debriefNarrative);
    const uniqueTokens = new Set(tokens);
    const lexicalRichness = tokens.length > 0 ? uniqueTokens.size / tokens.length : 0;
    const narrativeDepth = Math.min(1.0, tokens.length / 250.0);

    let sentimentScore = 0;
    for (let i = 0; i < tokens.length; i++) {
      const val = this.sentimentLexicon.get(tokens[i]);
      if (val !== undefined) {
        sentimentScore += val;
      }
    }
    const normalizedSentiment = Math.tanh(sentimentScore / 5.0);

    const isRestricted = post.classificationTier === "RESTRICTED" ? 1.0 : 0.5;
    const authorAuthority = post.isAnonymous ? 0.3 : 0.8;
    const redactionPenalty = post.isRedacted ? 0.8 : 0.0;

    const featureMap: Record<string, number> = {
      recencyScore,
      corroborationScore,
      discrepancyRatio,
      anomalyRatio,
      engagementVelocity: Math.tanh(engagementVelocity / 10.0),
      bayesianSeverity,
      mediaScore,
      lexicalRichness,
      narrativeDepth,
      normalizedSentiment,
      isRestricted,
      authorAuthority,
      redactionPenalty,
    };

    const rawVector = [
      recencyScore,
      corroborationScore,
      discrepancyRatio,
      anomalyRatio,
      featureMap.engagementVelocity,
      bayesianSeverity,
      mediaScore,
      lexicalRichness,
      narrativeDepth,
      normalizedSentiment,
      isRestricted,
      authorAuthority,
      redactionPenalty,
    ];

    const normalizedVector = new Float64Array(rawVector.length);
    for (let i = 0; i < rawVector.length; i++) {
      normalizedVector[i] = Math.max(-1.0, Math.min(1.0, rawVector[i]));
    }

    return {
      postId: post.id,
      rawVector,
      normalizedVector,
      featureMap,
    };
  }

  public extractBatch(posts: PostInput[], referenceTimeMs?: number): ExtractedFeatures[] {
    const results: ExtractedFeatures[] = [];
    for (let i = 0; i < posts.length; i++) {
      results.push(this.extractFeatures(posts[i], referenceTimeMs));
    }
    return results;
  }
}
