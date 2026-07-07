const { Redis } = require('ioredis');

const url = "rediss://default:gQAAAAAAAaXFAAIgcDExZjg2NzUwZjQ5YTE0NDNjODM1MGU4ZDBiMDM2NWVkOQ@adjusted-bobcat-107973.upstash.io:6379";

const redis = new Redis(url, {
  maxRetriesPerRequest: 1,
  family: 4,
  tls: { rejectUnauthorized: false },
});

redis.on('error', (err) => {
  console.error('Redis Error:', err);
  process.exit(1);
});

redis.on('connect', () => {
  console.log('Connected successfully!');
  process.exit(0);
});
