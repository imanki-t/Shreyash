import { Matrix, Vector } from "../core/types";
import { MatrixOperations, VectorOperations } from "../math/linear_algebra";

export class MarkovGraphRanker {
  private dampingFactor: number;
  private maxIterations: number;
  private tolerance: number;

  constructor(damping: number = 0.85, maxIter: number = 100, tol: number = 1e-6) {
    this.dampingFactor = damping;
    this.maxIterations = maxIter;
    this.tolerance = tol;
  }

  public computeStationaryDistribution(transitionMatrix: Matrix): Vector {
    const n = transitionMatrix.rows;
    if (n === 0) {
      return VectorOperations.create(0);
    }

    let p = VectorOperations.create(n, 1.0 / n);
    const uniform = VectorOperations.create(n, (1.0 - this.dampingFactor) / n);

    for (let iter = 0; iter < this.maxIterations; iter++) {
      const pTrans = MatrixOperations.multiplyVector(transitionMatrix, p);
      const damped = VectorOperations.scale(pTrans, this.dampingFactor);
      const nextP = VectorOperations.add(damped, uniform);

      const diff = VectorOperations.subtract(nextP, p);
      const err = VectorOperations.norm(diff);

      p = nextP;
      if (err < this.tolerance) {
        break;
      }
    }

    const norm = VectorOperations.norm(p);
    return norm > 0 ? VectorOperations.scale(p, 1.0 / norm) : p;
  }

  public buildAffiliationMatrix(posts: { authorCodename: string; docketSlug: string }[]): Matrix {
    const n = posts.length;
    const m = MatrixOperations.create(n, n, 0);

    for (let i = 0; i < n; i++) {
      let degree = 0;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        let weight = 0;
        if (posts[i].docketSlug === posts[j].docketSlug) weight += 1.0;
        if (posts[i].authorCodename === posts[j].authorCodename) weight += 2.0;

        m.data[i * n + j] = weight;
        degree += weight;
      }

      if (degree > 0) {
        for (let j = 0; j < n; j++) {
          m.data[i * n + j] /= degree;
        }
      } else {
        for (let j = 0; j < n; j++) {
          m.data[i * n + j] = 1.0 / n;
        }
      }
    }

    return MatrixOperations.transpose(m);
  }
}
