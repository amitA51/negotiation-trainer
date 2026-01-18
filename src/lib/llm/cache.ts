/**
 * ==========================================
 * 🗃️ LLM RESPONSE CACHE
 * ==========================================
 * Simple in-memory cache for LLM responses
 * Reduces API costs and improves response times
 * 
 * For production, consider using:
 * - Vercel KV (Redis)
 * - Upstash Redis
 * - Cloudflare KV
 */

import crypto from 'crypto';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hitCount: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: string;
}

class LLMCache<T = string> {
  private cache = new Map<string, CacheEntry<T>>();
  private hits = 0;
  private misses = 0;
  private readonly maxSize: number;
  private readonly defaultTTL: number;

  constructor(options?: { maxSize?: number; defaultTTL?: number }) {
    this.maxSize = options?.maxSize ?? 1000;
    this.defaultTTL = options?.defaultTTL ?? 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Generate a deterministic cache key from input
   */
  private generateKey(input: unknown): string {
    const normalized = JSON.stringify(input, Object.keys(input as object).sort());
    return crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 16);
  }

  /**
   * Get value from cache
   */
  get(input: unknown): T | null {
    const key = this.generateKey(input);
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update hit count
    entry.hitCount++;
    this.hits++;
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(input: unknown, value: T, ttl?: number): void {
    const key = this.generateKey(input);
    const expiresAt = Date.now() + (ttl ?? this.defaultTTL);

    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
      hitCount: 0,
    });
  }

  /**
   * Check if key exists and is valid
   */
  has(input: unknown): boolean {
    const key = this.generateKey(input);
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Invalidate a specific entry
   */
  invalidate(input: unknown): boolean {
    const key = this.generateKey(input);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Remove expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Evict oldest entries when at capacity
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total > 0 ? `${((this.hits / total) * 100).toFixed(1)}%` : '0%',
    };
  }
}

// ==========================================
// CACHE INSTANCES
// ==========================================

/** Cache for consultation responses (longer TTL - responses are more generic) */
export const consultationCache = new LLMCache<string>({
  maxSize: 500,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
});

/** Cache for analysis results (medium TTL) */
export const analysisCache = new LLMCache<object>({
  maxSize: 200,
  defaultTTL: 60 * 60 * 1000, // 1 hour
});

/** Cache for technique detection (short TTL - training is dynamic) */
export const techniqueCache = new LLMCache<string[]>({
  maxSize: 300,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Create cache key for chat requests
 */
export function createChatCacheKey(params: {
  mode: string;
  message?: string;
  difficulty?: number;
  scenarioId?: string;
}): object {
  return {
    mode: params.mode,
    message: params.message?.toLowerCase().trim(),
    difficulty: params.difficulty,
    scenarioId: params.scenarioId,
  };
}

/**
 * Create cache key for analysis requests
 */
export function createAnalysisCacheKey(params: {
  messages: Array<{ role: string; content: string }>;
  difficulty?: number;
}): object {
  // Use hash of conversation for key
  const conversationHash = crypto
    .createHash('sha256')
    .update(params.messages.map(m => `${m.role}:${m.content}`).join('|'))
    .digest('hex')
    .substring(0, 16);

  return {
    conversationHash,
    difficulty: params.difficulty,
  };
}

/**
 * Get or compute cached value
 */
export async function getOrCompute<T>(
  cache: LLMCache<T>,
  key: unknown,
  compute: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  // Compute and cache
  const result = await compute();
  cache.set(key, result, ttl);
  return result;
}

// ==========================================
// CLEANUP SCHEDULER
// ==========================================

// Run cleanup every 10 minutes in server environment
if (typeof window === 'undefined') {
  setInterval(() => {
    consultationCache.cleanup();
    analysisCache.cleanup();
    techniqueCache.cleanup();
  }, 10 * 60 * 1000);
}

export { LLMCache };
