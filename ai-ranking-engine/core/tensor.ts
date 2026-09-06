export class Tensor3D {
  public dim0: number;
  public dim1: number;
  public dim2: number;
  public data: Float64Array;

  constructor(dim0: number, dim1: number, dim2: number, fill: number = 0) {
    this.dim0 = dim0;
    this.dim1 = dim1;
    this.dim2 = dim2;
    this.data = new Float64Array(dim0 * dim1 * dim2);
    if (fill !== 0) {
      this.data.fill(fill);
    }
  }

  public get(i: number, j: number, k: number): number {
    return this.data[i * (this.dim1 * this.dim2) + j * this.dim2 + k];
  }

  public set(i: number, j: number, k: number, val: number): void {
    this.data[i * (this.dim1 * this.dim2) + j * this.dim2 + k] = val;
  }

  public slice(dim0Index: number): Float64Array {
    const size = this.dim1 * this.dim2;
    const start = dim0Index * size;
    return this.data.slice(start, start + size);
  }

  public reshape2D(): { rows: number; cols: number; data: Float64Array } {
    return {
      rows: this.dim0,
      cols: this.dim1 * this.dim2,
      data: new Float64Array(this.data),
    };
  }

  public sum(axis: 0 | 1 | 2): Float64Array {
    if (axis === 0) {
      const result = new Float64Array(this.dim1 * this.dim2);
      for (let i = 0; i < this.dim0; i++) {
        for (let j = 0; j < this.dim1; j++) {
          for (let k = 0; k < this.dim2; k++) {
            result[j * this.dim2 + k] += this.get(i, j, k);
          }
        }
      }
      return result;
    } else if (axis === 1) {
      const result = new Float64Array(this.dim0 * this.dim2);
      for (let i = 0; i < this.dim0; i++) {
        for (let j = 0; j < this.dim1; j++) {
          for (let k = 0; k < this.dim2; k++) {
            result[i * this.dim2 + k] += this.get(i, j, k);
          }
        }
      }
      return result;
    } else {
      const result = new Float64Array(this.dim0 * this.dim1);
      for (let i = 0; i < this.dim0; i++) {
        for (let j = 0; j < this.dim1; j++) {
          for (let k = 0; k < this.dim2; k++) {
            result[i * this.dim1 + j] += this.get(i, j, k);
          }
        }
      }
      return result;
    }
  }

  public mean(axis: 0 | 1 | 2): Float64Array {
    const sums = this.sum(axis);
    const count = axis === 0 ? this.dim0 : axis === 1 ? this.dim1 : this.dim2;
    for (let i = 0; i < sums.length; i++) {
      sums[i] /= count;
    }
    return sums;
  }

  public applyActivation(fn: (x: number) => number): Tensor3D {
    const res = new Tensor3D(this.dim0, this.dim1, this.dim2);
    for (let i = 0; i < this.data.length; i++) {
      res.data[i] = fn(this.data[i]);
    }
    return res;
  }
}
