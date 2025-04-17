import Redis from "ioredis";
import mysql from "mysql2";
import dotenv from 'dotenv';
import db from '../config.js';
dotenv.config();


const redis = new Redis({
  host: process.env.REDIS_HOST, // Replace with Redis Cloud details
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
});

redis.on('connect', () => {
  console.log('🔌 Redis client is connecting...');
});

redis.on('ready', () => {
  console.log('✅ Redis connection established and ready to use!');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('end', () => {
  console.log('🚪 Redis connection closed.');
});


async function initBloomFilter() {
  try {
    await redis.call("BF.RESERVE", "usernames", 0.01, 2000);
    // no of the Hash Functions k = (m / n) * ln(2)
//     n = number of expected items (here, 2000)
// m = number of bits in the filter
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

async function testMainBloom() {
  try {
    await redis.call("BF.RESERVE", "usernames_test", 0.01, 100);
  } catch (err) {
    if (err.message.includes("item exists")) {
      console.log("Bloom filter usernames_test already exists. Continuing...");
    } else {
      console.error("Error initializing Bloom filter:", err);
      return;
    }
  }

  try {
    const testUsername = "vinay_live_check";

    const existsBefore = await redis.call("BF.EXISTS", "usernames_test", testUsername);
    console.log("Exists before adding:", existsBefore); // should be 0

    await redis.call("BF.ADD", "usernames_test", testUsername);

    const existsAfter = await redis.call("BF.EXISTS", "usernames_test", testUsername);
    console.log("Exists after adding:", existsAfter); // should be 1

  } catch (err) {
    console.error("Error testing usernames_test Bloom filter:", err);
  }
}

testMainBloom();
