export interface IndexedVector {
  id: string;
  vector: Float64Array;
  metadata?: Record<string, unknown>;
}

export interface NearestNeighbor {
  id: string;
  distance: number;
  similarity: number;
  metadata?: Record<string, unknown>;
}

export class PositionalEncoding {
  private dimension: number;
  private maxPositions: number;
  private encodingTable: Float64Array[];

  constructor(dimension: number = 64, maxPositions: number = 512) {
    this.dimension = dimension;
    this.maxPositions = maxPositions;
    this.encodingTable = this.precomputeTable();
  }

  private precomputeTable(): Float64Array[] {
    const table: Float64Array[] = [];
    for (let pos = 0; pos < this.maxPositions; pos++) {
      const vec = new Float64Array(this.dimension);
      for (let i = 0; i < this.dimension; i += 2) {
        const divTerm = Math.exp((-i * Math.log(10000.0)) / this.dimension);
        vec[i] = Math.sin(pos * divTerm);
        if (i + 1 < this.dimension) {
          vec[i + 1] = Math.cos(pos * divTerm);
        }
      }
      table.push(vec);
    }
    return table;
  }

  public getEncoding(position: number): Float64Array {
    const safePos = Math.max(0, Math.min(this.maxPositions - 1, Math.floor(position)));
    return this.encodingTable[safePos];
  }

  public applyToVector(vector: Float64Array, position: number, scale: number = 0.1): Float64Array {
    const encoding = this.getEncoding(position);
    const result = new Float64Array(vector.length);
    const len = Math.min(vector.length, encoding.length);

    for (let i = 0; i < len; i++) {
      result[i] = vector[i] + scale * encoding[i];
    }
    for (let i = len; i < vector.length; i++) {
      result[i] = vector[i];
    }

    return result;
  }
}

export class VectorSimilarityIndex {
  private entries: Map<string, IndexedVector>;
  private dimension: number;

  constructor(dimension: number) {
    this.dimension = dimension;
    this.entries = new Map();
  }

  public insert(id: string, vector: Float64Array, metadata?: Record<string, unknown>): void {
    if (vector.length !== this.dimension) {
      const adjusted = new Float64Array(this.dimension);
      adjusted.set(vector.subarray(0, Math.min(vector.length, this.dimension)));
      this.entries.set(id, { id, vector: adjusted, metadata });
    } else {
      this.entries.set(id, { id, vector: new Float64Array(vector), metadata });
    }
  }

  public delete(id: string): boolean {
    return this.entries.delete(id);
  }

  public search(
    queryVector: Float64Array,
    k: number = 10,
    metric: "cosine" | "euclidean" = "cosine"
  ): NearestNeighbor[] {
    const results: NearestNeighbor[] = [];

    for (const entry of this.entries.values()) {
      let dist = 0;
      let sim = 0;

      if (metric === "cosine") {
        let dot = 0;
        let qNorm = 0;
        let eNorm = 0;

        for (let i = 0; i < this.dimension; i++) {
          const qVal = queryVector[i] || 0;
          const eVal = entry.vector[i] || 0;
          dot += qVal * eVal;
          qNorm += qVal * qVal;
          eNorm += eVal * eVal;
        }

        const denom = Math.sqrt(qNorm) * Math.sqrt(eNorm);
        sim = denom > 0 ? dot / denom : 0;
        dist = 1.0 - Math.max(-1.0, Math.min(1.0, sim));
      } else {
        let sumSq = 0;
        for (let i = 0; i < this.dimension; i++) {
          const diff = (queryVector[i] || 0) - (entry.vector[i] || 0);
          sumSq += diff * diff;
        }
        dist = Math.sqrt(sumSq);
        sim = 1.0 / (1.0 + dist);
      }

      results.push({
        id: entry.id,
        distance: dist,
        similarity: sim,
        metadata: entry.metadata,
      });
    }

    if (metric === "cosine") {
      results.sort((a, b) => b.similarity - a.similarity);
    } else {
      results.sort((a, b) => a.distance - b.distance);
    }

    return results.slice(0, k);
  }

  public size(): number {
    return this.entries.size;
  }

  public clear(): void {
    this.entries.clear();
  }
}

export class PrincipalComponentAnalysis {
  private targetDimension: number;
  private mean: Float64Array | null = null;
  private components: Float64Array[] = [];

  constructor(targetDimension: number) {
    this.targetDimension = targetDimension;
  }

  public fit(data: Float64Array[], iterations: number = 50): void {
    const n = data.length;
    if (n === 0) return;
    const inputDim = data[0].length;

    this.mean = new Float64Array(inputDim);
    for (let i = 0; i < n; i++) {
      for (let d = 0; d < inputDim; d++) {
        this.mean[d] += data[i][d] / n;
      }
    }

    const centeredData: Float64Array[] = [];
    for (let i = 0; i < n; i++) {
      const c = new Float64Array(inputDim);
      for (let d = 0; d < inputDim; d++) {
        c[d] = data[i][d] - this.mean[d];
      }
      centeredData.push(c);
    }

    const cov = new Float64Array(inputDim * inputDim);
    for (let i = 0; i < n; i++) {
      const row = centeredData[i];
      for (let r = 0; r < inputDim; r++) {
        for (let c = 0; c < inputDim; c++) {
          cov[r * inputDim + c] += (row[r] * row[c]) / (n - 1);
        }
      }
    }

    this.components = [];
    const numComponents = Math.min(this.targetDimension, inputDim);

    for (let comp = 0; comp < numComponents; comp++) {
      let vec = new Float64Array(inputDim);
      for (let d = 0; d < inputDim; d++) {
        vec[d] = Math.random() - 0.5;
      }

      for (let iter = 0; iter < iterations; iter++) {
        const nextVec = new Float64Array(inputDim);
        for (let r = 0; r < inputDim; r++) {
          let s = 0;
          for (let c = 0; c < inputDim; c++) {
            s += cov[r * inputDim + c] * vec[c];
          }
          nextVec[r] = s;
        }

        for (const prevComp of this.components) {
          let dot = 0;
          for (let d = 0; d < inputDim; d++) {
            dot += nextVec[d] * prevComp[d];
          }
          for (let d = 0; d < inputDim; d++) {
            nextVec[d] -= dot * prevComp[d];
          }
        }

        let norm = 0;
        for (let d = 0; d < inputDim; d++) {
          norm += nextVec[d] * nextVec[d];
        }
        norm = Math.sqrt(norm);

        if (norm > 1e-12) {
          for (let d = 0; d < inputDim; d++) {
            vec[d] = nextVec[d] / norm;
          }
        }
      }

      this.components.push(vec);
    }
  }

  public transform(vector: Float64Array): Float64Array {
    if (!this.mean || this.components.length === 0) {
      return vector.subarray(0, this.targetDimension);
    }

    const centered = new Float64Array(vector.length);
    for (let i = 0; i < vector.length; i++) {
      centered[i] = vector[i] - (this.mean[i] || 0);
    }

    const projected = new Float64Array(this.components.length);
    for (let c = 0; c < this.components.length; c++) {
      const comp = this.components[c];
      let dot = 0;
      for (let d = 0; d < Math.min(centered.length, comp.length); d++) {
        dot += centered[d] * comp[d];
      }
      projected[c] = dot;
    }

    return projected;
  }
}

export class RandomProjection {
  private inputDim: number;
  private outputDim: number;
  private projectionMatrix: Float64Array;

  constructor(inputDim: number, outputDim: number, seed: number = 42) {
    this.inputDim = inputDim;
    this.outputDim = outputDim;
    this.projectionMatrix = new Float64Array(inputDim * outputDim);
    this.initializeMatrix(seed);
  }

  private initializeMatrix(seed: number): void {
    let state = seed;
    const scale = 1.0 / Math.sqrt(this.outputDim);

    for (let i = 0; i < this.projectionMatrix.length; i++) {
      state = (state * 1664525 + 1013904223) % 4294967296;
      const u1 = Math.max(1e-10, state / 4294967296);
      state = (state * 1664525 + 1013904223) % 4294967296;
      const u2 = state / 4294967296;
      const normal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      this.projectionMatrix[i] = normal * scale;
    }
  }

  public project(vector: Float64Array): Float64Array {
    const result = new Float64Array(this.outputDim);
    for (let out = 0; out < this.outputDim; out++) {
      let sum = 0;
      for (let inp = 0; inp < Math.min(vector.length, this.inputDim); inp++) {
        sum += vector[inp] * this.projectionMatrix[inp * this.outputDim + out];
      }
      result[out] = sum;
    }
    return result;
  }
}
