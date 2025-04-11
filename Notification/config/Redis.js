import pkg from 'bullmq';
const { Connection } = pkg;

const redisConnection= new Connection({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
});

export default redisConnection;