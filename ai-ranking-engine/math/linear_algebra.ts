import { Vector, Matrix } from "../core/types";

export class VectorOperations {
  public static create(dimension: number, fillValue: number = 0): Vector {
    const data = new Float64Array(dimension);
    if (fillValue !== 0) {
      data.fill(fillValue);
    }
    return { dimension, data };
  }

  public static fromArray(values: number[]): Vector {
    const data = new Float64Array(values);
    return { dimension: values.length, data };
  }

  public static add(a: Vector, b: Vector): Vector {
    if (a.dimension !== b.dimension) {
      throw new Error("Dimension mismatch in vector addition");
    }
    const result = new Float64Array(a.dimension);
    for (let i = 0; i < a.dimension; i++) {
      result[i] = a.data[i] + b.data[i];
    }
    return { dimension: a.dimension, data: result };
  }

  public static subtract(a: Vector, b: Vector): Vector {
    if (a.dimension !== b.dimension) {
      throw new Error("Dimension mismatch in vector subtraction");
    }
    const result = new Float64Array(a.dimension);
    for (let i = 0; i < a.dimension; i++) {
      result[i] = a.data[i] - b.data[i];
    }
    return { dimension: a.dimension, data: result };
  }

  public static scale(v: Vector, scalar: number): Vector {
    const result = new Float64Array(v.dimension);
    for (let i = 0; i < v.dimension; i++) {
      result[i] = v.data[i] * scalar;
    }
    return { dimension: v.dimension, data: result };
  }

  public static dot(a: Vector, b: Vector): number {
    if (a.dimension !== b.dimension) {
      throw new Error("Dimension mismatch in vector dot product");
    }
    let sum = 0;
    for (let i = 0; i < a.dimension; i++) {
      sum += a.data[i] * b.data[i];
    }
    return sum;
  }

  public static hadamard(a: Vector, b: Vector): Vector {
    if (a.dimension !== b.dimension) {
      throw new Error("Dimension mismatch in hadamard product");
    }
    const result = new Float64Array(a.dimension);
    for (let i = 0; i < a.dimension; i++) {
      result[i] = a.data[i] * b.data[i];
    }
    return { dimension: a.dimension, data: result };
  }

  public static norm(v: Vector): number {
    return Math.sqrt(VectorOperations.dot(v, v));
  }

  public static normalize(v: Vector): Vector {
    const magnitude = VectorOperations.norm(v);
    if (magnitude === 0) {
      return VectorOperations.create(v.dimension, 0);
    }
    return VectorOperations.scale(v, 1.0 / magnitude);
  }

  public static cosineSimilarity(a: Vector, b: Vector): number {
    const normA = VectorOperations.norm(a);
    const normB = VectorOperations.norm(b);
    if (normA === 0 || normB === 0) {
      return 0;
    }
    return VectorOperations.dot(a, b) / (normA * normB);
  }

  public static euclideanDistance(a: Vector, b: Vector): number {
    const diff = VectorOperations.subtract(a, b);
    return VectorOperations.norm(diff);
  }

  public static manhattanDistance(a: Vector, b: Vector): number {
    if (a.dimension !== b.dimension) {
      throw new Error("Dimension mismatch in manhattan distance");
    }
    let sum = 0;
    for (let i = 0; i < a.dimension; i++) {
      sum += Math.abs(a.data[i] - b.data[i]);
    }
    return sum;
  }

  public static project(a: Vector, b: Vector): Vector {
    const bNormSq = VectorOperations.dot(b, b);
    if (bNormSq === 0) {
      return VectorOperations.create(a.dimension, 0);
    }
    const scalar = VectorOperations.dot(a, b) / bNormSq;
    return VectorOperations.scale(b, scalar);
  }

  public static linearInterpolation(a: Vector, b: Vector, t: number): Vector {
    if (a.dimension !== b.dimension) {
      throw new Error("Dimension mismatch in vector interpolation");
    }
    const clampedT = Math.max(0, Math.min(1, t));
    const result = new Float64Array(a.dimension);
    for (let i = 0; i < a.dimension; i++) {
      result[i] = a.data[i] * (1 - clampedT) + b.data[i] * clampedT;
    }
    return { dimension: a.dimension, data: result };
  }

  public static softmax(v: Vector, temperature: number = 1.0): Vector {
    const result = new Float64Array(v.dimension);
    let maxVal = -Infinity;
    for (let i = 0; i < v.dimension; i++) {
      if (v.data[i] > maxVal) {
        maxVal = v.data[i];
      }
    }
    let sumExp = 0;
    for (let i = 0; i < v.dimension; i++) {
      const expVal = Math.exp((v.data[i] - maxVal) / temperature);
      result[i] = expVal;
      sumExp += expVal;
    }
    if (sumExp === 0) {
      result.fill(1.0 / v.dimension);
      return { dimension: v.dimension, data: result };
    }
    for (let i = 0; i < v.dimension; i++) {
      result[i] /= sumExp;
    }
    return { dimension: v.dimension, data: result };
  }

  public static sigmoid(v: Vector): Vector {
    const result = new Float64Array(v.dimension);
    for (let i = 0; i < v.dimension; i++) {
      const x = v.data[i];
      result[i] = 1.0 / (1.0 + Math.exp(-Math.max(-45, Math.min(45, x))));
    }
    return { dimension: v.dimension, data: result };
  }

  public static relu(v: Vector): Vector {
    const result = new Float64Array(v.dimension);
    for (let i = 0; i < v.dimension; i++) {
      result[i] = Math.max(0, v.data[i]);
    }
    return { dimension: v.dimension, data: result };
  }

  public static tanh(v: Vector): Vector {
    const result = new Float64Array(v.dimension);
    for (let i = 0; i < v.dimension; i++) {
      result[i] = Math.tanh(v.data[i]);
    }
    return { dimension: v.dimension, data: result };
  }
}

export class MatrixOperations {
  public static create(rows: number, cols: number, fillValue: number = 0): Matrix {
    const data = new Float64Array(rows * cols);
    if (fillValue !== 0) {
      data.fill(fillValue);
    }
    return { rows, cols, data };
  }

  public static identity(size: number): Matrix {
    const m = MatrixOperations.create(size, size, 0);
    for (let i = 0; i < size; i++) {
      m.data[i * size + i] = 1.0;
    }
    return m;
  }

  public static from2DArray(values: number[][]): Matrix {
    const rows = values.length;
    if (rows === 0) {
      return MatrixOperations.create(0, 0);
    }
    const cols = values[0].length;
    const m = MatrixOperations.create(rows, cols);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        m.data[r * cols + c] = values[r][c];
      }
    }
    return m;
  }

  public static get(m: Matrix, row: number, col: number): number {
    return m.data[row * m.cols + col];
  }

  public static set(m: Matrix, row: number, col: number, value: number): void {
    m.data[row * m.cols + col] = value;
  }

  public static getRow(m: Matrix, row: number): Vector {
    const v = new Float64Array(m.cols);
    for (let c = 0; c < m.cols; c++) {
      v[c] = m.data[row * m.cols + c];
    }
    return { dimension: m.cols, data: v };
  }

  public static setRow(m: Matrix, row: number, v: Vector): void {
    if (v.dimension !== m.cols) {
      throw new Error("Row vector dimension mismatch");
    }
    for (let c = 0; c < m.cols; c++) {
      m.data[row * m.cols + c] = v.data[c];
    }
  }

  public static getCol(m: Matrix, col: number): Vector {
    const v = new Float64Array(m.rows);
    for (let r = 0; r < m.rows; r++) {
      v[r] = m.data[r * m.cols + col];
    }
    return { dimension: m.rows, data: v };
  }

  public static setCol(m: Matrix, col: number, v: Vector): void {
    if (v.dimension !== m.rows) {
      throw new Error("Col vector dimension mismatch");
    }
    for (let r = 0; r < m.rows; r++) {
      m.data[r * m.cols + col] = v.data[r];
    }
  }

  public static transpose(m: Matrix): Matrix {
    const result = MatrixOperations.create(m.cols, m.rows);
    for (let r = 0; r < m.rows; r++) {
      for (let c = 0; c < m.cols; c++) {
        result.data[c * m.rows + r] = m.data[r * m.cols + c];
      }
    }
    return result;
  }

  public static multiply(a: Matrix, b: Matrix): Matrix {
    if (a.cols !== b.rows) {
      throw new Error("Matrix dimensions incompatible for multiplication");
    }
    const result = MatrixOperations.create(a.rows, b.cols);
    for (let i = 0; i < a.rows; i++) {
      for (let j = 0; j < b.cols; j++) {
        let sum = 0;
        for (let k = 0; k < a.cols; k++) {
          sum += a.data[i * a.cols + k] * b.data[k * b.cols + j];
        }
        result.data[i * b.cols + j] = sum;
      }
    }
    return result;
  }

  public static multiplyVector(m: Matrix, v: Vector): Vector {
    if (m.cols !== v.dimension) {
      throw new Error("Matrix columns must equal vector dimension");
    }
    const result = new Float64Array(m.rows);
    for (let r = 0; r < m.rows; r++) {
      let sum = 0;
      for (let c = 0; c < m.cols; c++) {
        sum += m.data[r * m.cols + c] * v.data[c];
      }
      result[r] = sum;
    }
    return { dimension: m.rows, data: result };
  }

  public static outerProduct(u: Vector, v: Vector): Matrix {
    const m = MatrixOperations.create(u.dimension, v.dimension);
    for (let i = 0; i < u.dimension; i++) {
      for (let j = 0; j < v.dimension; j++) {
        m.data[i * v.dimension + j] = u.data[i] * v.data[j];
      }
    }
    return m;
  }

  public static add(a: Matrix, b: Matrix): Matrix {
    if (a.rows !== b.rows || a.cols !== b.cols) {
      throw new Error("Matrix dimension mismatch in addition");
    }
    const total = a.rows * a.cols;
    const result = MatrixOperations.create(a.rows, a.cols);
    for (let i = 0; i < total; i++) {
      result.data[i] = a.data[i] + b.data[i];
    }
    return result;
  }

  public static scale(m: Matrix, scalar: number): Matrix {
    const total = m.rows * m.cols;
    const result = MatrixOperations.create(m.rows, m.cols);
    for (let i = 0; i < total; i++) {
      result.data[i] = m.data[i] * scalar;
    }
    return result;
  }

  public static frobeniusNorm(m: Matrix): number {
    let sum = 0;
    const total = m.rows * m.cols;
    for (let i = 0; i < total; i++) {
      sum += m.data[i] * m.data[i];
    }
    return Math.sqrt(sum);
  }

  public static gramSchmidt(vectors: Vector[]): Vector[] {
    const orthogonal: Vector[] = [];
    for (let i = 0; i < vectors.length; i++) {
      let current = VectorOperations.fromArray(Array.from(vectors[i].data));
      for (let j = 0; j < orthogonal.length; j++) {
        const proj = VectorOperations.project(vectors[i], orthogonal[j]);
        current = VectorOperations.subtract(current, proj);
      }
      const norm = VectorOperations.norm(current);
      if (norm > 1e-10) {
        orthogonal.push(VectorOperations.scale(current, 1.0 / norm));
      }
    }
    return orthogonal;
  }

  public static invert2x2(m: Matrix): Matrix {
    if (m.rows !== 2 || m.cols !== 2) {
      throw new Error("Matrix must be 2x2 for direct inversion");
    }
    const a = m.data[0];
    const b = m.data[1];
    const c = m.data[2];
    const d = m.data[3];
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-12) {
      throw new Error("Matrix is singular");
    }
    const invDet = 1.0 / det;
    const result = MatrixOperations.create(2, 2);
    result.data[0] = d * invDet;
    result.data[1] = -b * invDet;
    result.data[2] = -c * invDet;
    result.data[3] = a * invDet;
    return result;
  }
}
