const redis = require('redis');
const log = require('./log')(module);

const redisClient = redis.createClient({
  host: process.env.ARENA_REDIS_HOST,
  port: process.env.ARENA_REDIS_PORT,
  password: process.env.ARENA_REDIS_PASSWORD,
});

redisClient.on('error', (err) => log.error(err));

module.exports = redisClient;