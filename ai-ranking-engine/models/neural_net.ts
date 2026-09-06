import { Vector, Matrix, LayerGradient, NetworkState, Hyperparameters } from "../core/types";
import { VectorOperations, MatrixOperations } from "../math/linear_algebra";

export class DenseLayer {
  public inputDim: number;
  public outputDim: number;
  public weights: Matrix;
  public biases: Vector;
  public weightM: Matrix;
  public weightV: Matrix;
  public biasM: Vector;
  public biasV: Vector;

  constructor(inputDim: number, outputDim: number, initScale: number = 0.1) {
    this.inputDim = inputDim;
    this.outputDim = outputDim;
    this.weights = MatrixOperations.create(outputDim, inputDim);
    this.biases = VectorOperations.create(outputDim, 0);

    const xavierLimit = Math.sqrt(6.0 / (inputDim + outputDim));
    for (let i = 0; i < outputDim * inputDim; i++) {
      this.weights.data[i] = (Math.random() * 2 - 1) * xavierLimit * initScale;
    }

    this.weightM = MatrixOperations.create(outputDim, inputDim, 0);
    this.weightV = MatrixOperations.create(outputDim, inputDim, 0);
    this.biasM = VectorOperations.create(outputDim, 0);
    this.biasV = VectorOperations.create(outputDim, 0);
  }

  public forward(input: Vector): { preActivation: Vector; activation: Vector } {
    const preActivation = MatrixOperations.multiplyVector(this.weights, input);
    const withBias = VectorOperations.add(preActivation, this.biases);
    const activation = VectorOperations.relu(withBias);
    return { preActivation: withBias, activation };
  }
}

export class NeuralRankingNetwork {
  private layers: DenseLayer[];
  private hyperparameters: Hyperparameters;
  private timeStep: number;

  constructor(inputDim: number, layerDims: number[] = [32, 16, 1], params?: Partial<Hyperparameters>) {
    this.hyperparameters = {
      learningRate: params?.learningRate ?? 0.005,
      l2Regularization: params?.l2Regularization ?? 0.0001,
      momentum: params?.momentum ?? 0.9,
      epochs: params?.epochs ?? 20,
      batchSize: params?.batchSize ?? 16,
      hiddenLayers: layerDims,
      dropoutRate: params?.dropoutRate ?? 0.1,
      temperature: params?.temperature ?? 1.0,
      halfLifeHours: params?.halfLifeHours ?? 72,
    };
    this.timeStep = 0;
    this.layers = [];

    let currentInput = inputDim;
    for (let i = 0; i < layerDims.length; i++) {
      const outDim = layerDims[i];
      this.layers.push(new DenseLayer(currentInput, outDim));
      currentInput = outDim;
    }
  }

  public predict(featureVector: Float64Array): number {
    let currentVector = { dimension: featureVector.length, data: featureVector };
    for (let i = 0; i < this.layers.length; i++) {
      const isLastLayer = i === this.layers.length - 1;
      const { preActivation, activation } = this.layers[i].forward(currentVector);
      if (isLastLayer) {
        return 1.0 / (1.0 + Math.exp(-Math.max(-20, Math.min(20, preActivation.data[0]))));
      }
      currentVector = activation;
    }
    return 0.5;
  }

  public predictBatch(vectors: Float64Array[]): number[] {
    const scores: number[] = [];
    for (let i = 0; i < vectors.length; i++) {
      scores.push(this.predict(vectors[i]));
    }
    return scores;
  }

  public computePairwiseLoss(scoreA: number, scoreB: number, actualPreference: number): number {
    const diff = scoreA - scoreB;
    const targetProb = actualPreference > 0 ? 1.0 : actualPreference < 0 ? 0.0 : 0.5;
    const predictedProb = 1.0 / (1.0 + Math.exp(-diff));
    return -targetProb * Math.log(Math.max(1e-12, predictedProb)) - (1 - targetProb) * Math.log(Math.max(1e-12, 1 - predictedProb));
  }

  public applyWeightDecay(layer: DenseLayer): void {
    const l2 = this.hyperparameters.l2Regularization;
    for (let i = 0; i < layer.weights.data.length; i++) {
      layer.weights.data[i] -= this.hyperparameters.learningRate * l2 * layer.weights.data[i];
    }
  }

  public adamUpdate(
    layer: DenseLayer,
    weightGrads: Matrix,
    biasGrads: Vector,
    beta1: number = 0.9,
    beta2: number = 0.999,
    epsilon: number = 1e-8
  ): void {
    this.timeStep += 1;
    const lr = this.hyperparameters.learningRate;
    const beta1Correction = 1.0 - Math.pow(beta1, this.timeStep);
    const beta2Correction = 1.0 - Math.pow(beta2, this.timeStep);

    for (let i = 0; i < layer.weights.data.length; i++) {
      const g = weightGrads.data[i];
      layer.weightM.data[i] = beta1 * layer.weightM.data[i] + (1 - beta1) * g;
      layer.weightV.data[i] = beta2 * layer.weightV.data[i] + (1 - beta2) * g * g;

      const mHat = layer.weightM.data[i] / beta1Correction;
      const vHat = layer.weightV.data[i] / beta2Correction;
      layer.weights.data[i] -= (lr * mHat) / (Math.sqrt(vHat) + epsilon);
    }

    for (let i = 0; i < layer.biases.data.length; i++) {
      const g = biasGrads.data[i];
      layer.biasM.data[i] = beta1 * layer.biasM.data[i] + (1 - beta1) * g;
      layer.biasV.data[i] = beta2 * layer.biasV.data[i] + (1 - beta2) * g * g;

      const mHat = layer.biasM.data[i] / beta1Correction;
      const vHat = layer.biasV.data[i] / beta2Correction;
      layer.biases.data[i] -= (lr * mHat) / (Math.sqrt(vHat) + epsilon);
    }

    this.applyWeightDecay(layer);
  }
}
