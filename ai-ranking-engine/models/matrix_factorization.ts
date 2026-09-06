import { LatentFactorModel } from "../core/types";

export class MatrixFactorizationRecommender {
  private model: LatentFactorModel;
  private userBiases: Map<string, number>;
  private itemBiases: Map<string, number>;
  private globalMean: number;

  constructor(dimensions: number = 8, regularization: number = 0.05) {
    this.model = {
      userEmbeddings: new Map<string, Float64Array>(),
      itemEmbeddings: new Map<string, Float64Array>(),
      latentDimensions: dimensions,
      regularization,
    };
    this.userBiases = new Map<string, number>();
    this.itemBiases = new Map<string, number>();
    this.globalMean = 3.0;
  }

  public getOrCreateUserEmbedding(userId: string): Float64Array {
    let emb = this.model.userEmbeddings.get(userId);
    if (!emb) {
      emb = new Float64Array(this.model.latentDimensions);
      for (let i = 0; i < this.model.latentDimensions; i++) {
        emb[i] = (Math.random() * 2 - 1) * 0.1;
      }
      this.model.userEmbeddings.set(userId, emb);
    }
    return emb;
  }

  public getOrCreateItemEmbedding(itemId: string): Float64Array {
    let emb = this.model.itemEmbeddings.get(itemId);
    if (!emb) {
      emb = new Float64Array(this.model.latentDimensions);
      for (let i = 0; i < this.model.latentDimensions; i++) {
        emb[i] = (Math.random() * 2 - 1) * 0.1;
      }
      this.model.itemEmbeddings.set(itemId, emb);
    }
    return emb;
  }

  public predictAffinity(userId: string, itemId: string): number {
    const userVector = this.getOrCreateUserEmbedding(userId);
    const itemVector = this.getOrCreateItemEmbedding(itemId);

    let dot = 0;
    for (let i = 0; i < this.model.latentDimensions; i++) {
      dot += userVector[i] * itemVector[i];
    }

    const uBias = this.userBiases.get(userId) || 0;
    const iBias = this.itemBiases.get(itemId) || 0;
    return this.globalMean + uBias + iBias + dot;
  }

  public trainStep(
    userId: string,
    itemId: string,
    rating: number,
    learningRate: number = 0.01
  ): number {
    const userVector = this.getOrCreateUserEmbedding(userId);
    const itemVector = this.getOrCreateItemEmbedding(itemId);

    const prediction = this.predictAffinity(userId, itemId);
    const error = rating - prediction;

    const uBias = this.userBiases.get(userId) || 0;
    const iBias = this.itemBiases.get(itemId) || 0;
    const reg = this.model.regularization;

    this.userBiases.set(userId, uBias + learningRate * (error - reg * uBias));
    this.itemBiases.set(itemId, iBias + learningRate * (error - reg * iBias));

    for (let k = 0; k < this.model.latentDimensions; k++) {
      const uVal = userVector[k];
      const iVal = itemVector[k];

      userVector[k] += learningRate * (error * iVal - reg * uVal);
      itemVector[k] += learningRate * (error * uVal - reg * iVal);
    }

    return error * error;
  }
}
