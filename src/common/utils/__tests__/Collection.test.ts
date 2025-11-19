import { Collection } from '../Collection';

describe('Collection', () => {
  let collection: Collection<string, number>;

  beforeEach(() => {
    collection = new Collection<string, number>();
    collection.set('one', 1);
    collection.set('two', 2);
    collection.set('three', 3);
  });

  describe('filter', () => {
    it('should filter items', () => {
      const filtered = collection.filter((value) => value > 1);
      expect(filtered.size).toBe(2);
      expect(filtered.has('two')).toBe(true);
      expect(filtered.has('three')).toBe(true);
    });
  });

  describe('map', () => {
    it('should map items to array', () => {
      const mapped = collection.map((value) => value * 2);
      expect(mapped).toEqual([2, 4, 6]);
    });
  });

  describe('find', () => {
    it('should find item', () => {
      const found = collection.find((value) => value === 2);
      expect(found).toBe(2);
    });

    it('should return undefined if not found', () => {
      const found = collection.find((value) => value === 10);
      expect(found).toBeUndefined();
    });
  });

  describe('some', () => {
    it('should return true if some match', () => {
      const result = collection.some((value) => value > 2);
      expect(result).toBe(true);
    });

    it('should return false if none match', () => {
      const result = collection.some((value) => value > 10);
      expect(result).toBe(false);
    });
  });

  describe('every', () => {
    it('should return true if all match', () => {
      const result = collection.every((value) => value > 0);
      expect(result).toBe(true);
    });

    it('should return false if not all match', () => {
      const result = collection.every((value) => value > 1);
      expect(result).toBe(false);
    });
  });

  describe('first and last', () => {
    it('should return first item', () => {
      expect(collection.first()).toBe(1);
    });

    it('should return last item', () => {
      expect(collection.last()).toBe(3);
    });
  });

  describe('random', () => {
    it('should return a random item', () => {
      const random = collection.random();
      expect([1, 2, 3]).toContain(random);
    });
  });

  describe('array and keyArray', () => {
    it('should return array of values', () => {
      const array = collection.array();
      expect(array).toEqual([1, 2, 3]);
    });

    it('should return array of keys', () => {
      const keys = collection.keyArray();
      expect(keys).toEqual(['one', 'two', 'three']);
    });
  });
});
