const memory = new Map();

let redisClient = null;
if (process.env.REDIS_URL) {
  try {
    // eslint-disable-next-line global-require
    const Redis = require('ioredis');
    redisClient = new Redis(process.env.REDIS_URL);
  } catch (err) {
    console.warn('[dataset.cache] Redis unavailable, using in-memory fallback', err.message);
  }
}

function cacheKey(userId, datasetId) {
  return `ds:u${userId}:d${datasetId}`;
}

async function set(userId, datasetId, buffer) {
  const key = cacheKey(userId, datasetId);
  if (redisClient) {
    await redisClient.set(key, buffer);
    return;
  }
  memory.set(key, Buffer.from(buffer));
}

async function get(userId, datasetId) {
  const key = cacheKey(userId, datasetId);
  if (redisClient) {
    const buf = await redisClient.getBuffer(key);
    return buf || null;
  }
  return memory.get(key) || null;
}

async function del(userId, datasetId) {
  const key = cacheKey(userId, datasetId);
  if (redisClient) await redisClient.del(key);
  else memory.delete(key);
}

module.exports = { set, get, del };
