export class FastRankingCache<K, V> {
  private capacity: number;
  private cache: Map<K, { value: V; timestamp: number }>;

  constructor(capacity: number = 2000) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  public get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    this.cache.delete(key);
    this.cache.set(key, { value: entry.value, timestamp: Date.now() });
    return entry.value;
  }

  public set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  public has(key: K): boolean {
    return this.cache.has(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}
