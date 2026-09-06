import { Vector, Matrix } from "../core/types";
import { VectorOperations, MatrixOperations } from "../math/linear_algebra";

export class MultiHeadAttention {
  private heads: number;
  private embedDim: number;
  private headDim: number;
  private wQuery: Matrix;
  private wKey: Matrix;
  private wValue: Matrix;
  private wOut: Matrix;

  constructor(embedDim: number, heads: number = 4) {
    if (embedDim % heads !== 0) {
      throw new Error("embedDim must be divisible by heads");
    }
    this.embedDim = embedDim;
    this.heads = heads;
    this.headDim = embedDim / heads;

    this.wQuery = MatrixOperations.create(embedDim, embedDim);
    this.wKey = MatrixOperations.create(embedDim, embedDim);
    this.wValue = MatrixOperations.create(embedDim, embedDim);
    this.wOut = MatrixOperations.create(embedDim, embedDim);

    this.initializeWeights();
  }

  private initializeWeights(): void {
    const scale = Math.sqrt(2.0 / this.embedDim);
    for (let i = 0; i < this.embedDim * this.embedDim; i++) {
      this.wQuery.data[i] = (Math.random() * 2 - 1) * scale;
      this.wKey.data[i] = (Math.random() * 2 - 1) * scale;
      this.wValue.data[i] = (Math.random() * 2 - 1) * scale;
      this.wOut.data[i] = (Math.random() * 2 - 1) * scale;
    }
  }

  public computeAttention(queries: Vector[], keys: Vector[], values: Vector[]): Vector[] {
    const seqLen = queries.length;
    const outputs: Vector[] = [];

    const projectedQueries = queries.map((q) => MatrixOperations.multiplyVector(this.wQuery, q));
    const projectedKeys = keys.map((k) => MatrixOperations.multiplyVector(this.wKey, k));
    const projectedValues = values.map((v) => MatrixOperations.multiplyVector(this.wValue, v));

    const scale = 1.0 / Math.sqrt(this.headDim);

    for (let i = 0; i < seqLen; i++) {
      const q = projectedQueries[i];
      const scores = new Float64Array(seqLen);

      for (let j = 0; j < seqLen; j++) {
        const k = projectedKeys[j];
        scores[j] = VectorOperations.dot(q, k) * scale;
      }

      const weights = VectorOperations.softmax({ dimension: seqLen, data: scores });
      const aggregated = VectorOperations.create(this.embedDim, 0);

      for (let j = 0; j < seqLen; j++) {
        const weightedVal = VectorOperations.scale(projectedValues[j], weights.data[j]);
        for (let d = 0; d < this.embedDim; d++) {
          aggregated.data[d] += weightedVal.data[d];
        }
      }

      const projectedOut = MatrixOperations.multiplyVector(this.wOut, aggregated);
      outputs.push(projectedOut);
    }

    return outputs;
  }
}
