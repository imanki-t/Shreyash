export class BitSet {
  private words: Uint32Array;
  private bitLength: number;

  constructor(size: number) {
    this.bitLength = size;
    const wordCount = Math.ceil(size / 32);
    this.words = new Uint32Array(wordCount);
  }

  public set(index: number): void {
    if (index < 0 || index >= this.bitLength) return;
    const wordIndex = Math.floor(index / 32);
    const bitIndex = index % 32;
    this.words[wordIndex] |= 1 << bitIndex;
  }

  public get(index: number): boolean {
    if (index < 0 || index >= this.bitLength) return false;
    const wordIndex = Math.floor(index / 32);
    const bitIndex = index % 32;
    return (this.words[wordIndex] & (1 << bitIndex)) !== 0;
  }

  public clear(): void {
    this.words.fill(0);
  }

  public countBits(): number {
    let count = 0;
    for (let i = 0; i < this.words.length; i++) {
      let w = this.words[i];
      while (w > 0) {
        w &= w - 1;
        count++;
      }
    }
    return count;
  }

  public getSize(): number {
    return this.bitLength;
  }
}

export class BloomFilter {
  private bitSet: BitSet;
  private numHashFunctions: number;
  private capacity: number;
  private insertedCount: number;

  constructor(expectedElements: number = 10000, falsePositiveRate: number = 0.01) {
    this.capacity = expectedElements;
    const m = Math.ceil((-expectedElements * Math.log(falsePositiveRate)) / Math.pow(Math.log(2), 2));
    const k = Math.round((m / expectedElements) * Math.log(2));

    this.bitSet = new BitSet(Math.max(64, m));
    this.numHashFunctions = Math.max(1, k);
    this.insertedCount = 0;
  }

  private hash(key: string, seed: number): number {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;

    for (let i = 0; i < key.length; i++) {
      const ch = key.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }

  public add(key: string): void {
    const size = this.bitSet.getSize();
    for (let i = 0; i < this.numHashFunctions; i++) {
      const hashValue = Math.abs(this.hash(key, i * 0x5bd1e995 + 1)) % size;
      this.bitSet.set(hashValue);
    }
    this.insertedCount++;
  }

  public contains(key: string): boolean {
    const size = this.bitSet.getSize();
    for (let i = 0; i < this.numHashFunctions; i++) {
      const hashValue = Math.abs(this.hash(key, i * 0x5bd1e995 + 1)) % size;
      if (!this.bitSet.get(hashValue)) {
        return false;
      }
    }
    return true;
  }

  public clear(): void {
    this.bitSet.clear();
    this.insertedCount = 0;
  }

  public estimatedFalsePositiveRate(): number {
    const m = this.bitSet.getSize();
    const k = this.numHashFunctions;
    const n = this.insertedCount;
    return Math.pow(1 - Math.exp((-k * n) / m), k);
  }

  public getStats(): { capacity: number; inserted: number; bitSize: number; hashCount: number; currentFPR: number } {
    return {
      capacity: this.capacity,
      inserted: this.insertedCount,
      bitSize: this.bitSet.getSize(),
      hashCount: this.numHashFunctions,
      currentFPR: this.estimatedFalsePositiveRate(),
    };
  }
}

export class PostDeduplicationFilter {
  private titleFilter: BloomFilter;
  private narrativeFilter: BloomFilter;

  constructor(expectedCapacity: number = 5000) {
    this.titleFilter = new BloomFilter(expectedCapacity, 0.005);
    this.narrativeFilter = new BloomFilter(expectedCapacity, 0.005);
  }

  public isDuplicate(title: string, narrative: string): boolean {
    const normalizedTitle = title.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const narrativeSnippet = narrative.trim().toLowerCase().slice(0, 100).replace(/[^a-z0-9]/g, "");

    const titleSeen = this.titleFilter.contains(normalizedTitle);
    const narrativeSeen = narrativeSnippet.length > 20 ? this.narrativeFilter.contains(narrativeSnippet) : false;

    return titleSeen || narrativeSeen;
  }

  public register(title: string, narrative: string): void {
    const normalizedTitle = title.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const narrativeSnippet = narrative.trim().toLowerCase().slice(0, 100).replace(/[^a-z0-9]/g, "");

    this.titleFilter.add(normalizedTitle);
    if (narrativeSnippet.length > 20) {
      this.narrativeFilter.add(narrativeSnippet);
    }
  }

  public reset(): void {
    this.titleFilter.clear();
    this.narrativeFilter.clear();
  }
}
