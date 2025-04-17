import dotenv from 'dotenv';
import mysql from 'mysql2';

dotenv.config();

const pool= mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,  // Maximum number of connections
    queueLimit: 0
});

const promisePool= pool.promise();
export default promisePool;