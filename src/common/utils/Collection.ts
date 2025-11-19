/**
 * A Map with additional utility methods
 */
export class Collection<K, V> extends Map<K, V> {
  /**
   * Identical to Array.filter()
   */
  public filter(fn: (value: V, key: K, collection: this) => boolean): Collection<K, V> {
    const results = new Collection<K, V>();
    for (const [key, val] of this) {
      if (fn(val, key, this)) results.set(key, val);
    }
    return results;
  }

  /**
   * Identical to Array.map()
   */
  public map<T>(fn: (value: V, key: K, collection: this) => T): T[] {
    const arr: T[] = [];
    for (const [key, val] of this) {
      arr.push(fn(val, key, this));
    }
    return arr;
  }

  /**
   * Identical to Array.find()
   */
  public find(fn: (value: V, key: K, collection: this) => boolean): V | undefined {
    for (const [key, val] of this) {
      if (fn(val, key, this)) return val;
    }
    return undefined;
  }

  /**
   * Identical to Array.some()
   */
  public some(fn: (value: V, key: K, collection: this) => boolean): boolean {
    for (const [key, val] of this) {
      if (fn(val, key, this)) return true;
    }
    return false;
  }

  /**
   * Identical to Array.every()
   */
  public every(fn: (value: V, key: K, collection: this) => boolean): boolean {
    for (const [key, val] of this) {
      if (!fn(val, key, this)) return false;
    }
    return true;
  }

  /**
   * Returns the first value in the collection
   */
  public first(): V | undefined {
    return this.values().next().value;
  }

  /**
   * Returns the last value in the collection
   */
  public last(): V | undefined {
    return Array.from(this.values())[this.size - 1];
  }

  /**
   * Returns a random value from the collection
   */
  public random(): V | undefined {
    const arr = Array.from(this.values());
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Returns an array of values
   */
  public array(): V[] {
    return Array.from(this.values());
  }

  /**
   * Returns an array of keys
   */
  public keyArray(): K[] {
    return Array.from(this.keys());
  }
}
