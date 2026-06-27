import redis from "redis"
import dotenv from "dotenv"
dotenv.config()

const redisUrl = process.env.REDIS_URL;

export const redisClient = redis.createClient({
    url: redisUrl,
});

redisClient.on('connect', () => {
    console.log('RedisDB connected');
});

redisClient.on('error', (err) => {
    console.error('Lỗi kết nối Redis:', err);
});

export const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Không thể kết nối Redis:', err);
    }
}
