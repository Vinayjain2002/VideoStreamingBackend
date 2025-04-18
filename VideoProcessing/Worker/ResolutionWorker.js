import { Worker } from "bullmq";
import dotenv from 'dotenv';
import { processVideo } from "../utils/videoProcessor.js";
import axios from "axios";
dotenv.config();

export const ResoltionWorker= new Worker(
    "ResolutionQueue",async(job)=>{

        console.log(`Changing Resolution: ${job.data.VideoID} and ChunkUrl: ${job.data.chunkUrl}`);

        const chunkUrl = job.data.chunkUrl;
        const videoID = job.data.VideoID;
        const ChunkIndex= job.data.chunkIndex;
        // Step 1: Download the video chunk from S3 URL
        const response = await axios({
          method: "get",
          url: chunkUrl,
          responseType: "arraybuffer", // Getting the buffer data
        });   

        // Woker had just Downloaded the Video
        console.log("Chunk Video Data", response.data);

        const videoBuffer = Buffer.from(response.data);
        const fileName = `chunk_${videoID}_${Date.now()}.ts`; // You can customize how to name it
    
        console.log(`Video Chunk Downloaded: ${fileName}`);
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
        console.log("videoBuffer",videoBuffer)
        console.log("fileName", fileName);
        console.log("VideoID", videoID);
        console.log("Chunk Index", ChunkIndex);
        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
        // Step 3: Process the downloaded video chunk with the video buffer and file name
        await processVideo(videoBuffer, fileName, videoID, ChunkIndex);
    
        console.log(`Resolution Changed for Video: ${videoID}`);
    },
    {
      connection: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          password: process.env.REDIS_PASSWORD
      }
  }
);

ResoltionWorker.on("completed", (job) => {
    console.log(`Job completed: ${job.id}`);
  });
  
  ResoltionWorker.on("failed", (job, err) => {
    console.error(`Job failed: ${job.id}`, err);
  });
  