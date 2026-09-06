import {
  PostInput,
  RankingRequest,
  RankingResponse,
  RankingScore,
  FeatureWeights
} from "../core/types";
import { FeatureExtractor } from "../features/extractor";
import { NeuralRankingNetwork } from "../models/neural_net";
import { BayesianCredibilityScorer } from "../models/bayesian_scorer";
import { MatrixFactorizationRecommender } from "../models/matrix_factorization";
import { RankingEvaluator } from "../evaluation/metrics";

export class AIRankingEngine {
  private featureExtractor: FeatureExtractor;
  private neuralNet: NeuralRankingNetwork;
  private bayesianScorer: BayesianCredibilityScorer;
  private collaborativeFilter: MatrixFactorizationRecommender;

  constructor() {
    this.featureExtractor = new FeatureExtractor();
    this.neuralNet = new NeuralRankingNetwork(16, [32, 16, 1]);
    this.bayesianScorer = new BayesianCredibilityScorer();
    this.collaborativeFilter = new MatrixFactorizationRecommender();
  }

  public rank(request: RankingRequest): RankingResponse {
    const startTime = Date.now();
    const posts = request.posts;
    if (!posts || posts.length === 0) {
      return {
        rankedPosts: [],
        metrics: {
          totalEvaluated: 0,
          processingTimeMs: 0,
          meanScore: 0,
          variance: 0,
        },
      };
    }

    const scores: RankingScore[] = [];
    const extractedBatch = this.featureExtractor.extractBatch(posts);

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const features = extractedBatch[i];

      const neuralScore = this.neuralNet.predict(features.normalizedVector);
      const bayesianResult = this.bayesianScorer.computeCredibility(post);
      const controversyScore = this.bayesianScorer.computeControversy(post);

      const recencyScore = features.featureMap.recencyScore || 0;
      const corroborationScore = features.featureMap.corroborationScore || 0;
      const severityScore = features.featureMap.bayesianSeverity || 0;
      const mediaScore = features.featureMap.mediaScore || 0;
      const velocityScore = features.featureMap.engagementVelocity || 0;
      const dwellScore = features.featureMap.dwellScore || 0;
      const scrollRate = features.featureMap.scrollRate || 0;
      const reportPenalty = features.featureMap.reportPenalty || 0;

      let weightedScore =
        neuralScore * 0.28 +
        bayesianResult.lowerBound * 0.20 +
        dwellScore * 0.16 +
        scrollRate * 0.10 +
        recencyScore * 0.10 +
        severityScore * 0.08 +
        mediaScore * 0.08 -
        reportPenalty * 0.25;

      if (post.isRedacted) {
        weightedScore *= 0.7;
      }

      if (request.context?.preferredDockets && request.context.preferredDockets.includes(post.docketSlug)) {
        weightedScore *= 1.15;
      }

      scores.push({
        postId: post.id,
        caseNumber: post.caseNumber,
        finalScore: Math.max(0, Math.min(1.0, weightedScore)),
        neuralScore,
        bayesianScore: bayesianResult.expectedScore,
        recencyScore,
        corroborationScore,
        diversityPenalty: 0,
        rank: 0,
        featureContributions: {
          neural: neuralScore * 0.28,
          bayesian: bayesianResult.lowerBound * 0.20,
          dwell: dwellScore * 0.16,
          scroll: scrollRate * 0.10,
          recency: recencyScore * 0.10,
          severity: severityScore * 0.08,
          media: mediaScore * 0.08,
          reportPenalty: reportPenalty * -0.25,
          controversy: controversyScore,
        },
      });
    }

    scores.sort((a, b) => b.finalScore - a.finalScore);

    let finalRanked = scores;
    if (request.applyDiversity && scores.length > 2) {
      const simMatrix: number[][] = [];
      for (let r = 0; r < scores.length; r++) {
        simMatrix[r] = [];
        const postR = posts.find((p) => p.id === scores[r].postId);
        for (let c = 0; c < scores.length; c++) {
          const postC = posts.find((p) => p.id === scores[c].postId);
          let sim = 0;
          if (postR && postC) {
            if (postR.docketSlug === postC.docketSlug) sim += 0.6;
            if (postR.authorCodename === postC.authorCodename) sim += 0.4;
          }
          simMatrix[r][c] = sim;
        }
      }
      finalRanked = RankingEvaluator.maximalMarginalRelevance(scores, simMatrix, 0.75, request.topK || 50);
    }

    for (let r = 0; r < finalRanked.length; r++) {
      finalRanked[r].rank = r + 1;
    }

    const totalScores = finalRanked.map((s) => s.finalScore);
    let sum = 0;
    for (let s = 0; s < totalScores.length; s++) {
      sum += totalScores[s];
    }
    const mean = totalScores.length > 0 ? sum / totalScores.length : 0;

    let varianceSum = 0;
    for (let s = 0; s < totalScores.length; s++) {
      varianceSum += Math.pow(totalScores[s] - mean, 2);
    }
    const variance = totalScores.length > 1 ? varianceSum / (totalScores.length - 1) : 0;

    return {
      rankedPosts: finalRanked.slice(0, request.topK || 50),
      metrics: {
        totalEvaluated: posts.length,
        processingTimeMs: Date.now() - startTime,
        meanScore: Number(mean.toFixed(4)),
        variance: Number(variance.toFixed(4)),
      },
    };
  }
}
