const Redis = require("ioredis");

/**
 * High-performance Redis client with automatic in-memory fallback.
 * If REDIS_URL is configured and reachable, uses ioredis.
 * Otherwise transparently falls back to an ultra-fast Map with TTL support
 * so the API never blocks or crashes when a local Redis daemon isn't running.
 */
class MemoryRedisStore {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key, value, mode, ttlSeconds) {
    const expiresAt = ttlSeconds ? Date.now() + Number(ttlSeconds) * 1000 : null;
    this.store.set(key, { value: String(value), expiresAt });
    return "OK";
  }

  async del(...keys) {
    let deleted = 0;
    for (const key of keys.flat()) {
      if (this.store.delete(key)) deleted += 1;
    }
    return deleted;
  }

  async keys(pattern) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const matched = [];
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        this.store.delete(key);
        continue;
      }
      if (regex.test(key)) matched.push(key);
    }
    return matched;
  }

  async flushall() {
    this.store.clear();
    return "OK";
  }
}

const memoryStore = new MemoryRedisStore();
let activeClient = memoryStore;
let isExternalRedis = false;

const redisUrl = (process.env.REDIS_URL || "").trim();

if (redisUrl) {
  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 3000,
      retryStrategy(times) {
        if (times > 2) return null; // Fall back to memory store if unreachable
        return Math.min(times * 200, 1000);
      },
    });

    client.on("ready", () => {
      activeClient = client;
      isExternalRedis = true;
      console.log("Redis connected successfully");
    });

    client.on("error", () => {
      activeClient = memoryStore;
      isExternalRedis = false;
    });
  } catch {
    activeClient = memoryStore;
  }
}

const getRedisClient = () => activeClient;
const getRedisStatus = () => (isExternalRedis ? "redis" : "memory-redis");

module.exports = {
  getRedisClient,
  getRedisStatus,
};
