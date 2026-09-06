export interface Vector {
  dimension: number;
  data: Float64Array;
}

export interface Matrix {
  rows: number;
  cols: number;
  data: Float64Array;
}

export interface PostInput {
  id: string;
  caseNumber: string;
  title: string;
  docketSlug: string;
  classificationTier: string;
  debriefNarrative: string;
  createdAt: Date | string;
  attachmentsCount: number;
  hasVideo: boolean;
  hasAudio: boolean;
  hasImage: boolean;
  stamps: {
    verifiedAccurate: number;
    corroborated: number;
    flaggedAnomaly: number;
    discrepancyDetected: number;
  };
  emojis: {
    thumbsUp: number;
    thumbsDown: number;
    laugh: number;
    skull: number;
    heart: number;
  };
  ratings: {
    average: number;
    count: number;
    totalScore: number;
  };
  authorCodename: string;
  isAnonymous: boolean;
  isRedacted: boolean;
}

export interface ExtractedFeatures {
  postId: string;
  rawVector: number[];
  normalizedVector: Float64Array;
  featureMap: Record<string, number>;
}

export interface FeatureWeights {
  recencyWeight: number;
  corroborationWeight: number;
  severityWeight: number;
  engagementVelocityWeight: number;
  lexicalRichnessWeight: number;
  mediaRichnessWeight: number;
  discrepancyPenalty: number;
  redactionPenalty: number;
  authorityWeight: number;
}

export interface Hyperparameters {
  learningRate: number;
  l2Regularization: number;
  momentum: number;
  epochs: number;
  batchSize: number;
  hiddenLayers: number[];
  dropoutRate: number;
  temperature: number;
  halfLifeHours: number;
}

export interface LatentFactorModel {
  userEmbeddings: Map<string, Float64Array>;
  itemEmbeddings: Map<string, Float64Array>;
  latentDimensions: number;
  regularization: number;
}

export interface RankingScore {
  postId: string;
  caseNumber: string;
  finalScore: number;
  neuralScore: number;
  bayesianScore: number;
  recencyScore: number;
  corroborationScore: number;
  diversityPenalty: number;
  rank: number;
  featureContributions: Record<string, number>;
}

export interface TokenizerConfig {
  minTokenLength: number;
  maxTokenLength: number;
  lowercase: boolean;
  removePunctuation: boolean;
  ngramRange: [number, number];
  maxVocabSize: number;
}

export interface CorpusStatistics {
  documentCount: number;
  termFrequencies: Map<string, number>;
  documentFrequencies: Map<string, number>;
  averageDocumentLength: number;
  vocabulary: Map<string, number>;
  inverseVocabulary: string[];
}

export interface LayerGradient {
  weightGradients: Matrix;
  biasGradients: Vector;
}

export interface NetworkState {
  layerActivations: Vector[];
  layerPreActivations: Vector[];
}

export interface EvaluationResult {
  ndcgAt5: number;
  ndcgAt10: number;
  mrr: number;
  precisionAt5: number;
  recallAt5: number;
  diversityScore: number;
}

export interface UserContext {
  userId?: string;
  preferredDockets?: string[];
  historicalInteractions?: string[];
  clearanceLevel?: string;
}

export interface RankingRequest {
  posts: PostInput[];
  context?: UserContext;
  weightsOverride?: Partial<FeatureWeights>;
  topK?: number;
  applyDiversity?: boolean;
}

export interface RankingResponse {
  rankedPosts: RankingScore[];
  metrics: {
    totalEvaluated: number;
    processingTimeMs: number;
    meanScore: number;
    variance: number;
  };
}
