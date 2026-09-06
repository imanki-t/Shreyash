export interface NGramStats {
  ngram: string;
  frequency: number;
  probability: number;
}

export class NGramExtractor {
  public static extractCharacterNGrams(text: string, n: number = 3): string[] {
    const cleaned = text.toLowerCase().replace(/\s+/g, " ").trim();
    if (cleaned.length < n) return [cleaned];
    const ngrams: string[] = [];
    for (let i = 0; i <= cleaned.length - n; i++) {
      ngrams.push(cleaned.substring(i, i + n));
    }
    return ngrams;
  }

  public static extractWordNGrams(tokens: string[], n: number = 2): string[] {
    if (tokens.length < n) return [tokens.join(" ")];
    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(" "));
    }
    return ngrams;
  }

  public static extractSkipGrams(tokens: string[], kSkip: number = 2): [string, string][] {
    const skipgrams: [string, string][] = [];
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j <= Math.min(tokens.length - 1, i + 1 + kSkip); j++) {
        skipgrams.push([tokens[i], tokens[j]]);
      }
    }
    return skipgrams;
  }
}

export class PointwiseMutualInformation {
  private wordCounts: Map<string, number>;
  private bigramCounts: Map<string, number>;
  private totalWords: number;
  private totalBigrams: number;

  constructor() {
    this.wordCounts = new Map();
    this.bigramCounts = new Map();
    this.totalWords = 0;
    this.totalBigrams = 0;
  }

  public ingestDocument(tokens: string[]): void {
    for (let i = 0; i < tokens.length; i++) {
      const w = tokens[i];
      this.wordCounts.set(w, (this.wordCounts.get(w) || 0) + 1);
      this.totalWords++;

      if (i + 1 < tokens.length) {
        const bigram = `${tokens[i]}__${tokens[i + 1]}`;
        this.bigramCounts.set(bigram, (this.bigramCounts.get(bigram) || 0) + 1);
        this.totalBigrams++;
      }
    }
  }

  public computePMI(w1: string, w2: string): number {
    const bigramKey = `${w1}__${w2}`;
    const bigramFreq = this.bigramCounts.get(bigramKey) || 0;
    if (bigramFreq === 0) return 0;

    const w1Freq = this.wordCounts.get(w1) || 0;
    const w2Freq = this.wordCounts.get(w2) || 0;
    if (w1Freq === 0 || w2Freq === 0) return 0;

    const p_xy = bigramFreq / this.totalBigrams;
    const p_x = w1Freq / this.totalWords;
    const p_y = w2Freq / this.totalWords;

    const pmi = Math.log2(p_xy / (p_x * p_y));
    return Math.max(0, pmi);
  }
}

export class ShannonEntropy {
  public static computeTextEntropy(text: string): number {
    if (text.length === 0) return 0;
    const charFreq = new Map<string, number>();

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      charFreq.set(char, (charFreq.get(char) || 0) + 1);
    }

    let entropy = 0;
    const len = text.length;

    for (const count of charFreq.values()) {
      const p = count / len;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }

    return entropy;
  }

  public static computeTokenEntropy(tokens: string[]): number {
    if (tokens.length === 0) return 0;
    const tokenFreq = new Map<string, number>();

    for (const t of tokens) {
      tokenFreq.set(t, (tokenFreq.get(t) || 0) + 1);
    }

    let entropy = 0;
    const len = tokens.length;

    for (const count of tokenFreq.values()) {
      const p = count / len;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }

    return entropy;
  }
}

export class JaccardTextSimilarity {
  public static compute(tokensA: string[], tokensB: string[]): number {
    if (tokensA.length === 0 && tokensB.length === 0) return 1.0;
    if (tokensA.length === 0 || tokensB.length === 0) return 0.0;

    const setA = new Set(tokensA);
    const setB = new Set(tokensB);

    let intersectionSize = 0;
    for (const item of setA) {
      if (setB.has(item)) {
        intersectionSize++;
      }
    }

    const unionSize = setA.size + setB.size - intersectionSize;
    return unionSize > 0 ? intersectionSize / unionSize : 0;
  }

  public static computeNGramJaccard(textA: string, textB: string, n: number = 3): number {
    const ngramsA = NGramExtractor.extractCharacterNGrams(textA, n);
    const ngramsB = NGramExtractor.extractCharacterNGrams(textB, n);
    return JaccardTextSimilarity.compute(ngramsA, ngramsB);
  }
}

export class BM25Scorer {
  private k1: number;
  private b: number;
  private avgDocLength: number;
  private docFrequencies: Map<string, number>;
  private totalDocs: number;

  constructor(k1: number = 1.2, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
    this.avgDocLength = 0;
    this.docFrequencies = new Map();
    this.totalDocs = 0;
  }

  public fit(documents: string[][]): void {
    this.totalDocs = documents.length;
    if (this.totalDocs === 0) return;

    this.docFrequencies.clear();
    let totalLen = 0;

    for (const doc of documents) {
      totalLen += doc.length;
      const seenInDoc = new Set(doc);
      for (const word of seenInDoc) {
        this.docFrequencies.set(word, (this.docFrequencies.get(word) || 0) + 1);
      }
    }

    this.avgDocLength = totalLen / this.totalDocs;
  }

  public scoreDocument(queryTokens: string[], docTokens: string[]): number {
    if (this.totalDocs === 0 || docTokens.length === 0) return 0;

    const docLen = docTokens.length;
    const termCounts = new Map<string, number>();

    for (const t of docTokens) {
      termCounts.set(t, (termCounts.get(t) || 0) + 1);
    }

    let score = 0;

    for (const qTerm of queryTokens) {
      const tf = termCounts.get(qTerm) || 0;
      if (tf === 0) continue;

      const df = this.docFrequencies.get(qTerm) || 0;
      const idf = Math.log((this.totalDocs - df + 0.5) / (df + 0.5) + 1.0);

      const num = tf * (this.k1 + 1);
      const denom = tf + this.k1 * (1 - this.b + this.b * (docLen / Math.max(1, this.avgDocLength)));

      score += idf * (num / denom);
    }

    return Math.max(0, score);
  }
}
