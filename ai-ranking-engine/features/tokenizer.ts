import { TokenizerConfig, CorpusStatistics } from "../core/types";

export class TextTokenizer {
  private config: TokenizerConfig;
  private stopWords: Set<string>;

  constructor(config?: Partial<TokenizerConfig>) {
    this.config = {
      minTokenLength: config?.minTokenLength ?? 2,
      maxTokenLength: config?.maxTokenLength ?? 25,
      lowercase: config?.lowercase ?? true,
      removePunctuation: config?.removePunctuation ?? true,
      ngramRange: config?.ngramRange ?? [1, 2],
      maxVocabSize: config?.maxVocabSize ?? 5000,
    };
    this.stopWords = new Set([
      "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
      "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
      "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
      "or", "an", "will", "my", "one", "all", "would", "there", "their", "what"
    ]);
  }

  public tokenize(text: string): string[] {
    if (!text || text.length === 0) {
      return [];
    }
    let processed = text;
    if (this.config.lowercase) {
      processed = processed.toLowerCase();
    }
    if (this.config.removePunctuation) {
      processed = processed.replace(/[^a-z0-9\s_-]/g, " ");
    }
    const rawTokens = processed.split(/\s+/);
    const validTokens: string[] = [];

    for (let i = 0; i < rawTokens.length; i++) {
      const tok = rawTokens[i].trim();
      if (
        tok.length >= this.config.minTokenLength &&
        tok.length <= this.config.maxTokenLength &&
        !this.stopWords.has(tok)
      ) {
        validTokens.push(tok);
      }
    }

    if (this.config.ngramRange[1] > 1) {
      return this.generateNgrams(validTokens);
    }
    return validTokens;
  }

  private generateNgrams(unigrams: string[]): string[] {
    const results: string[] = [...unigrams];
    const maxN = this.config.ngramRange[1];

    for (let n = 2; n <= maxN; n++) {
      for (let i = 0; i <= unigrams.length - n; i++) {
        const ngram = unigrams.slice(i, i + n).join("_");
        results.push(ngram);
      }
    }
    return results;
  }

  public computeTermFrequencies(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      tf.set(t, (tf.get(t) || 0) + 1);
    }
    return tf;
  }

  public computeCorpusStatistics(documents: string[]): CorpusStatistics {
    const termFrequencies = new Map<string, number>();
    const documentFrequencies = new Map<string, number>();
    let totalLength = 0;

    for (let d = 0; d < documents.length; d++) {
      const tokens = this.tokenize(documents[d]);
      totalLength += tokens.length;
      const seenInDoc = new Set<string>();

      for (let t = 0; t < tokens.length; t++) {
        const token = tokens[t];
        termFrequencies.set(token, (termFrequencies.get(token) || 0) + 1);
        if (!seenInDoc.has(token)) {
          seenInDoc.add(token);
          documentFrequencies.set(token, (documentFrequencies.get(token) || 0) + 1);
        }
      }
    }

    const sortedTokens = Array.from(termFrequencies.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.config.maxVocabSize);

    const vocabulary = new Map<string, number>();
    const inverseVocabulary: string[] = [];

    for (let i = 0; i < sortedTokens.length; i++) {
      const token = sortedTokens[i][0];
      vocabulary.set(token, i);
      inverseVocabulary.push(token);
    }

    const docCount = documents.length;
    const avgLen = docCount > 0 ? totalLength / docCount : 0;

    return {
      documentCount: docCount,
      termFrequencies,
      documentFrequencies,
      averageDocumentLength: avgLen,
      vocabulary,
      inverseVocabulary,
    };
  }

  public computeTfidfVector(tokens: string[], stats: CorpusStatistics): Float64Array {
    const vector = new Float64Array(stats.inverseVocabulary.length);
    const tf = this.computeTermFrequencies(tokens);
    const docCount = Math.max(1, stats.documentCount);

    for (let i = 0; i < stats.inverseVocabulary.length; i++) {
      const term = stats.inverseVocabulary[i];
      const count = tf.get(term) || 0;
      if (count > 0) {
        const df = stats.documentFrequencies.get(term) || 1;
        const idf = Math.log(1.0 + (docCount - df + 0.5) / (df + 0.5));
        const normalizedTf = count / (tokens.length || 1);
        vector[i] = normalizedTf * Math.max(0, idf);
      }
    }

    let normSq = 0;
    for (let i = 0; i < vector.length; i++) {
      normSq += vector[i] * vector[i];
    }
    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }
    return vector;
  }
}
