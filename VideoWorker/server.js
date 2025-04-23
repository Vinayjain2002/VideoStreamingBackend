import { Worker } from "bullmq";
import dotenv from "dotenv";
import { processVideo } from "./services/videoProcessor.js";
import db from "./db.js";
import connectDB from "./connectDB.js";

dotenv.config();
connectDB();
  
db.query("Select 1")
.then(()=> console.log("MySQL Database Connected Successfully"))
.catch(err => console.log("Database Connection Failed", err));

  
const videoWorker = new Worker(
    "videoQueue",
    async (job) => {
      console.log("The Job Which Comes for the Processing is defined as the ");
      console.log(job.data);
      await processVideo(job.data);
    },
    {
      connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD

      },
    }
  );


  videoWorker.on("completed", (job) => {
    console.log(`Job completed: ${job.id}`);
  });
  
  videoWorker.on("failed", (job, err) => {
    console.error(`Job failed: ${job.id}`, err);
  });