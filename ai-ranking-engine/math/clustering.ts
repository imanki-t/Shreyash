export interface ClusterResult {
  clusterAssignments: number[];
  centroids: Float64Array[];
  inertia: number;
  iterations: number;
}

export interface DBSCANResult {
  labels: number[];
  clusterCount: number;
  noiseCount: number;
}

export class ClusteringMetrics {
  public static euclideanDistance(a: Float64Array, b: Float64Array): number {
    let sum = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  public static cosineDistance(a: Float64Array, b: Float64Array): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 1.0;
    const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
    return 1.0 - Math.max(-1.0, Math.min(1.0, similarity));
  }

  public static silhouetteScore(data: Float64Array[], labels: number[]): number {
    const n = data.length;
    if (n <= 1) return 0;

    const uniqueLabels = Array.from(new Set(labels)).filter((l) => l >= 0);
    if (uniqueLabels.length <= 1) return 0;

    let totalSilhouette = 0;
    let validPoints = 0;

    for (let i = 0; i < n; i++) {
      const currentLabel = labels[i];
      if (currentLabel < 0) continue;

      let intraDistSum = 0;
      let intraCount = 0;

      for (let j = 0; j < n; j++) {
        if (i !== j && labels[j] === currentLabel) {
          intraDistSum += ClusteringMetrics.euclideanDistance(data[i], data[j]);
          intraCount++;
        }
      }

      const a_i = intraCount > 0 ? intraDistSum / intraCount : 0;

      let minInterDist = Infinity;
      for (const otherLabel of uniqueLabels) {
        if (otherLabel === currentLabel) continue;

        let interDistSum = 0;
        let interCount = 0;
        for (let j = 0; j < n; j++) {
          if (labels[j] === otherLabel) {
            interDistSum += ClusteringMetrics.euclideanDistance(data[i], data[j]);
            interCount++;
          }
        }

        if (interCount > 0) {
          const avgInter = interDistSum / interCount;
          if (avgInter < minInterDist) {
            minInterDist = avgInter;
          }
        }
      }

      const b_i = minInterDist;
      const denom = Math.max(a_i, b_i);
      const s_i = denom > 0 ? (b_i - a_i) / denom : 0;

      totalSilhouette += s_i;
      validPoints++;
    }

    return validPoints > 0 ? totalSilhouette / validPoints : 0;
  }
}

export class KMeans {
  private k: number;
  private maxIterations: number;
  private tolerance: number;

  constructor(k: number = 3, maxIterations: number = 100, tolerance: number = 1e-4) {
    this.k = k;
    this.maxIterations = maxIterations;
    this.tolerance = tolerance;
  }

  private initCentroidsPlusPlus(data: Float64Array[]): Float64Array[] {
    const n = data.length;
    const dim = data[0].length;
    const centroids: Float64Array[] = [];

    const firstIndex = Math.floor(Math.random() * n);
    centroids.push(new Float64Array(data[firstIndex]));

    while (centroids.length < this.k) {
      const distances: number[] = new Array(n);
      let totalWeight = 0;

      for (let i = 0; i < n; i++) {
        let minDist = Infinity;
        for (const c of centroids) {
          const d = ClusteringMetrics.euclideanDistance(data[i], c);
          if (d < minDist) minDist = d;
        }
        const weight = minDist * minDist;
        distances[i] = weight;
        totalWeight += weight;
      }

      const threshold = Math.random() * totalWeight;
      let cumSum = 0;
      let selectedIdx = n - 1;

      for (let i = 0; i < n; i++) {
        cumSum += distances[i];
        if (cumSum >= threshold) {
          selectedIdx = i;
          break;
        }
      }

      centroids.push(new Float64Array(data[selectedIdx]));
    }

    return centroids;
  }

  public fit(data: Float64Array[]): ClusterResult {
    const n = data.length;
    if (n === 0) {
      return { clusterAssignments: [], centroids: [], inertia: 0, iterations: 0 };
    }

    const actualK = Math.min(this.k, n);
    let centroids = this.initCentroidsPlusPlus(data);
    const assignments = new Int32Array(n);
    let iterations = 0;
    let inertia = 0;

    for (let iter = 0; iter < this.maxIterations; iter++) {
      iterations++;
      let changed = false;
      inertia = 0;

      for (let i = 0; i < n; i++) {
        let minD = Infinity;
        let bestCluster = 0;

        for (let c = 0; c < actualK; c++) {
          const d = ClusteringMetrics.euclideanDistance(data[i], centroids[c]);
          if (d < minD) {
            minD = d;
            bestCluster = c;
          }
        }

        inertia += minD * minD;
        if (assignments[i] !== bestCluster) {
          assignments[i] = bestCluster;
          changed = true;
        }
      }

      const dim = data[0].length;
      const newCentroids: Float64Array[] = [];
      const counts = new Int32Array(actualK);

      for (let c = 0; c < actualK; c++) {
        newCentroids.push(new Float64Array(dim));
      }

      for (let i = 0; i < n; i++) {
        const cluster = assignments[i];
        counts[cluster]++;
        for (let d = 0; d < dim; d++) {
          newCentroids[cluster][d] += data[i][d];
        }
      }

      let maxShift = 0;
      for (let c = 0; c < actualK; c++) {
        if (counts[c] > 0) {
          for (let d = 0; d < dim; d++) {
            newCentroids[c][d] /= counts[c];
          }
        } else {
          newCentroids[c] = new Float64Array(data[Math.floor(Math.random() * n)]);
        }

        const shift = ClusteringMetrics.euclideanDistance(centroids[c], newCentroids[c]);
        if (shift > maxShift) {
          maxShift = shift;
        }
      }

      centroids = newCentroids;

      if (maxShift < this.tolerance || !changed) {
        break;
      }
    }

    return {
      clusterAssignments: Array.from(assignments),
      centroids,
      inertia,
      iterations,
    };
  }
}

export class DBSCAN {
  private eps: number;
  private minPts: number;

  constructor(eps: number = 0.5, minPts: number = 3) {
    this.eps = eps;
    this.minPts = minPts;
  }

  private regionQuery(data: Float64Array[], pointIdx: number): number[] {
    const neighbors: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (ClusteringMetrics.euclideanDistance(data[pointIdx], data[i]) <= this.eps) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  public fit(data: Float64Array[]): DBSCANResult {
    const n = data.length;
    const labels = new Int32Array(n);
    labels.fill(-1);

    const visited = new Uint8Array(n);
    let clusterId = 0;

    for (let i = 0; i < n; i++) {
      if (visited[i] === 1) continue;
      visited[i] = 1;

      const neighborPts = this.regionQuery(data, i);

      if (neighborPts.length < this.minPts) {
        labels[i] = -1;
      } else {
        labels[i] = clusterId;

        const seedList = [...neighborPts];
        let p = 0;

        while (p < seedList.length) {
          const currentPt = seedList[p];

          if (visited[currentPt] === 0) {
            visited[currentPt] = 1;
            const currentNeighbors = this.regionQuery(data, currentPt);

            if (currentNeighbors.length >= this.minPts) {
              for (const np of currentNeighbors) {
                if (!seedList.includes(np)) {
                  seedList.push(np);
                }
              }
            }
          }

          if (labels[currentPt] === -1) {
            labels[currentPt] = clusterId;
          }

          p++;
        }

        clusterId++;
      }
    }

    let noise = 0;
    for (let i = 0; i < n; i++) {
      if (labels[i] === -1) noise++;
    }

    return {
      labels: Array.from(labels),
      clusterCount: clusterId,
      noiseCount: noise,
    };
  }
}

export class AnomalyScorer {
  private centroids: Float64Array[];
  private clusterRadii: number[];

  constructor(centroids: Float64Array[], clusterRadii: number[]) {
    this.centroids = centroids;
    this.clusterRadii = clusterRadii;
  }

  public scoreAnomaly(point: Float64Array): { anomalyScore: number; nearestCluster: number; minDistance: number } {
    if (this.centroids.length === 0) {
      return { anomalyScore: 0, nearestCluster: 0, minDistance: 0 };
    }

    let minDistance = Infinity;
    let nearestCluster = 0;

    for (let c = 0; c < this.centroids.length; c++) {
      const dist = ClusteringMetrics.euclideanDistance(point, this.centroids[c]);
      if (dist < minDistance) {
        minDistance = dist;
        nearestCluster = c;
      }
    }

    const radius = this.clusterRadii[nearestCluster] || 1.0;
    const ratio = minDistance / Math.max(1e-5, radius);
    const score = 1.0 / (1.0 + Math.exp(-2.0 * (ratio - 1.5)));

    return {
      anomalyScore: Math.max(0, Math.min(1.0, score)),
      nearestCluster,
      minDistance,
    };
  }
}
