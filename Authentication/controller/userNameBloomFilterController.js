import Redis from "ioredis";
import mysql from "mysql2";
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.DB_HOST, process.env.DB_NAME, process.env.DB_PASSWORD, process.env.DB_USER);

const redis = new Redis({
  host: process.env.REDIS_HOST, // Replace with Redis Cloud details
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
});


const pool= mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,  // Maximum number of connections
    queueLimit: 0
});

const db= pool.promise();

// Call this once on startup
async function initBloomFilter() {
  try {
    await redis.call("BF.RESERVE", "usernames", 0.01, 2000);
    console.log("Bloom filter initialized ✅");
  } catch (err) {
    if (!err.message.includes("item exists")) {
      console.error("Error initializing Bloom filter:", err.message);
    }
  }
}
initBloomFilter();

export const checkAndRegisterUsername = async (req, res) => {
  const { username, email, passwordHash } = req.body;

  try {
    const mightExist = await redis.call("BF.EXISTS", "usernames", username);

    if (mightExist === 1) {
      const [rows] = await db.query("SELECT userID FROM users WHERE username = ?", [username]);
      if (rows.length > 0) {
        return res.status(409).json({ error: "Username already taken" });
      }
    }

    await db.query("INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)", [username, email, passwordHash]);
    await redis.call("BF.ADD", "usernames", username);

    res.status(201).json({ message: "Username registered successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};