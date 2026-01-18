/**
 * Tests for LLM Cache system
 */

import { LLMCache, createChatCacheKey, createAnalysisCacheKey, getOrCompute } from '@/lib/llm/cache';

describe('LLMCache', () => {
  let cache: LLMCache<string>;

  beforeEach(() => {
    cache = new LLMCache<string>({ maxSize: 5, defaultTTL: 1000 });
  });

  describe('basic operations', () => {
    it('should set and get values', () => {
      cache.set({ key: 'test' }, 'value');
      expect(cache.get({ key: 'test' })).toBe('value');
    });

    it('should return null for missing keys', () => {
      expect(cache.get({ key: 'nonexistent' })).toBeNull();
    });

    it('should check if key exists', () => {
      cache.set({ key: 'exists' }, 'value');
      expect(cache.has({ key: 'exists' })).toBe(true);
      expect(cache.has({ key: 'missing' })).toBe(false);
    });

    it('should invalidate specific entries', () => {
      cache.set({ key: 'toDelete' }, 'value');
      expect(cache.get({ key: 'toDelete' })).toBe('value');
      
      cache.invalidate({ key: 'toDelete' });
      expect(cache.get({ key: 'toDelete' })).toBeNull();
    });

    it('should clear all entries', () => {
      cache.set({ key: '1' }, 'a');
      cache.set({ key: '2' }, 'b');
      
      cache.clear();
      
      expect(cache.get({ key: '1' })).toBeNull();
      expect(cache.get({ key: '2' })).toBeNull();
    });
  });

  describe('TTL expiration', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should expire entries after TTL', () => {
      cache.set({ key: 'expires' }, 'value', 500);
      
      expect(cache.get({ key: 'expires' })).toBe('value');
      
      jest.advanceTimersByTime(600);
      
      expect(cache.get({ key: 'expires' })).toBeNull();
    });

    it('should cleanup expired entries', () => {
      cache.set({ key: '1' }, 'a', 100);
      cache.set({ key: '2' }, 'b', 500);
      cache.set({ key: '3' }, 'c', 1000);
      
      jest.advanceTimersByTime(300);
      
      const removed = cache.cleanup();
      expect(removed).toBe(1);
    });
  });

  describe('capacity management', () => {
    it('should evict oldest entry when at capacity', () => {
      // Fill cache
      for (let i = 0; i < 5; i++) {
        cache.set({ key: `entry-${i}` }, `value-${i}`);
      }
      
      // Add one more
      cache.set({ key: 'new-entry' }, 'new-value');
      
      // First entry should be evicted
      expect(cache.get({ key: 'entry-0' })).toBeNull();
      expect(cache.get({ key: 'new-entry' })).toBe('new-value');
    });
  });

  describe('stats tracking', () => {
    it('should track hits and misses', () => {
      cache.set({ key: 'exists' }, 'value');
      
      cache.get({ key: 'exists' }); // hit
      cache.get({ key: 'exists' }); // hit
      cache.get({ key: 'missing' }); // miss
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe('66.7%');
    });
  });

  describe('deterministic keys', () => {
    it('should generate same key for same input regardless of property order', () => {
      cache.set({ a: 1, b: 2 }, 'value1');
      expect(cache.get({ b: 2, a: 1 })).toBe('value1');
    });
  });
});

describe('createChatCacheKey', () => {
  it('should create normalized cache keys', () => {
    const key1 = createChatCacheKey({
      mode: 'training',
      message: 'Hello World',
      difficulty: 3,
    });
    
    const key2 = createChatCacheKey({
      mode: 'training',
      message: '  Hello World  ',
      difficulty: 3,
    });
    
    expect(key1).toEqual(key2);
  });

  it('should lowercase messages', () => {
    const key1 = createChatCacheKey({
      mode: 'training',
      message: 'HELLO',
    });
    
    const key2 = createChatCacheKey({
      mode: 'training',
      message: 'hello',
    });
    
    expect(key1).toEqual(key2);
  });
});

describe('createAnalysisCacheKey', () => {
  it('should create hash-based keys for messages', () => {
    const key = createAnalysisCacheKey({
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi' },
      ],
      difficulty: 3,
    });
    
    expect(key).toHaveProperty('conversationHash');
    expect(key).toHaveProperty('difficulty', 3);
  });

  it('should generate different hashes for different conversations', () => {
    const key1 = createAnalysisCacheKey({
      messages: [{ role: 'user', content: 'Hello' }],
    });
    
    const key2 = createAnalysisCacheKey({
      messages: [{ role: 'user', content: 'Goodbye' }],
    });
    
    expect((key1 as { conversationHash: string }).conversationHash)
      .not.toBe((key2 as { conversationHash: string }).conversationHash);
  });
});

describe('getOrCompute', () => {
  let cache: LLMCache<string>;

  beforeEach(() => {
    cache = new LLMCache<string>();
  });

  it('should return cached value if exists', async () => {
    cache.set({ key: 'cached' }, 'cached-value');
    const compute = jest.fn().mockResolvedValue('computed-value');
    
    const result = await getOrCompute(cache, { key: 'cached' }, compute);
    
    expect(result).toBe('cached-value');
    expect(compute).not.toHaveBeenCalled();
  });

  it('should compute and cache value if not exists', async () => {
    const compute = jest.fn().mockResolvedValue('computed-value');
    
    const result = await getOrCompute(cache, { key: 'new' }, compute);
    
    expect(result).toBe('computed-value');
    expect(compute).toHaveBeenCalledTimes(1);
    expect(cache.get({ key: 'new' })).toBe('computed-value');
  });

  it('should respect custom TTL', async () => {
    jest.useFakeTimers();
    
    const compute = jest.fn().mockResolvedValue('value');
    await getOrCompute(cache, { key: 'ttl-test' }, compute, 500);
    
    expect(cache.get({ key: 'ttl-test' })).toBe('value');
    
    jest.advanceTimersByTime(600);
    
    expect(cache.get({ key: 'ttl-test' })).toBeNull();
    
    jest.useRealTimers();
  });
});
