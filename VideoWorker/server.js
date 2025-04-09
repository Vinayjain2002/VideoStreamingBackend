import { Worker } from "bullmq";
import dotenv from "dotenv";
import { processVideo } from "./services/videoProcessor.js";
import { connectDB } from "./db.js";

dotenv.config();

const videoWorker = new Worker(
    "videoQueue",
    async (job) => {
      console.log(`Processing video: ${job.data.filename} from ${job.data.s3Url}`);
      await processVideo(job.data);
    },
    {
      connection: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT || 6379,
      },
    }
  );

  connectDB();
  
  videoWorker.on("completed", (job) => {
    console.log(`Job completed: ${job.id}`);
  });
  
  videoWorker.on("failed", (job, err) => {
    console.error(`Job failed: ${job.id}`, err);
  });
  