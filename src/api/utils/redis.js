const redis = require('redis');

module.exports = redis.createClient({
  host: process.env.ARENA_REDIS_HOST,
  port: process.env.ARENA_REDIS_PORT,
  password: process.env.ARENA_REDIS_PASSWORD,
});