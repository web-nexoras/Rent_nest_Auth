const { getRedisClient, getRedisStatus } = require("../configs/redisConfig");

// Read-through cache middleware for GET requests
const cacheGet = (namespace, ttlSeconds = 30) => {
  return async (req, res, next) => {
    if (req.method !== "GET") return next();

    const client = getRedisClient();
    const userScope = req.user ? `${req.user.role}:${req.user._id}` : "public";
    const cacheKey = `rn:${namespace}:${userScope}:${req.originalUrl}`;

    try {
      const cached = await client.get(cacheKey);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Cache-Engine", getRedisStatus());
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (error) {
      // Ignore cache read errors
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      res.setHeader("X-Cache", "MISS");
      res.setHeader("X-Cache-Engine", getRedisStatus());
      if (res.statusCode >= 200 && res.statusCode < 300 && body?.success !== false) {
        client
          .set(cacheKey, JSON.stringify(body), "EX", ttlSeconds)
          .catch(() => {});
      }
      return originalJson(body);
    };

    return next();
  };
};

// Clear cached keys by namespace
const invalidateCache = async (...namespaces) => {
  const client = getRedisClient();
  try {
    if (!namespaces.length || namespaces.includes("*")) {
      const keys = await client.keys("rn:*");
      if (keys.length) await client.del(keys);
      return;
    }
    for (const ns of namespaces) {
      const keys = await client.keys(`rn:${ns}:*`);
      if (keys.length) await client.del(keys);
    }
  } catch {
    // Ignore cache invalidation errors
  }
};

// Auto-clear related cache namespaces after successful write operations
const clearCacheOnSuccess = (...namespaces) => {
  return (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        invalidateCache(...namespaces);
      }
    });
    next();
  };
};

module.exports = {
  cacheGet,
  invalidateCache,
  clearCacheOnSuccess,
};
