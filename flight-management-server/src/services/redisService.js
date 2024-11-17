const Redis = require('ioredis');

class RedisService {
    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'redis',
            port: process.env.REDIS_PORT || 6379,
            password: 'redispass',
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 5,
            enableReadyCheck: true,
            reconnectOnError: (err) => {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
                    return true;
                }
                return false;
            }
        });

        this.redis.on('error', (error) => {
            console.error('Redis connection error:', error);
        });

        this.redis.on('connect', () => {
            console.log('Successfully connected to Redis');
        });

        this.redis.on('ready', () => {
            console.log('Redis is ready to accept commands');
        });

        this.redis.on('reconnecting', () => {
            console.log('Redis is reconnecting...');
        });
    }

    async get(key) {
        try {
            return await this.redis.get(key);
        } catch (error) {
            console.error('Redis get error:', error);
            throw error;
        }
    }

    async set(key, value) {
        try {
            return await this.redis.set(key, value);
        } catch (error) {
            console.error('Redis set error:', error);
            throw error;
        }
    }

    async isConnected() {
        try {
            await this.redis.ping();
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new RedisService(); 