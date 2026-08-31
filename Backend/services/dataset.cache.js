const memory = new Map();

let redisClient = null;
let isRedisAvailable = false;

if (process.env.REDIS_URL) {
  try {
    // eslint-disable-next-line global-require
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[dataset.cache] Redis connection failed multiple times. Using in-memory fallback.');
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      console.log('[dataset.cache] Connected to Redis successfully');
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      console.warn('[dataset.cache] Redis error (using in-memory fallback):', err.message);
    });
  } catch (err) {
    console.warn('[dataset.cache] Failed to initialize Redis client, using in-memory fallback:', err.message);
    redisClient = null;
  }
}

function cacheKey(userId, datasetId) {
  return `ds:u${userId}:d${datasetId}`;
}

async function set(userId, datasetId, buffer) {
  const key = cacheKey(userId, datasetId);
  if (redisClient && isRedisAvailable) {
    try {
      await redisClient.set(key, buffer);
      return;
    } catch (err) {
      console.warn('[dataset.cache] Redis set failed, falling back to memory:', err.message);
    }
  }
  memory.set(key, Buffer.from(buffer));
}

async function get(userId, datasetId) {
  const key = cacheKey(userId, datasetId);
  if (redisClient && isRedisAvailable) {
    try {
      const buf = await redisClient.getBuffer(key);
      return buf || null;
    } catch (err) {
      console.warn('[dataset.cache] Redis get failed, falling back to memory:', err.message);
    }
  }
  return memory.get(key) || null;
}

async function del(userId, datasetId) {
  const key = cacheKey(userId, datasetId);
  if (redisClient && isRedisAvailable) {
    try {
      await redisClient.del(key);
      return;
    } catch (err) {
      console.warn('[dataset.cache] Redis del failed, falling back to memory:', err.message);
    }
  }
  memory.delete(key);
}

module.exports = { set, get, del };
