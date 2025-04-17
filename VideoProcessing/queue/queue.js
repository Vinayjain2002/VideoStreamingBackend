import { Queue } from "bullmq";
import dotenv from 'dotenv';
dotenv.config();

export const ResolutionQueue= new Queue("ResolutionQueue", {
    connection:{
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    }
});

  
ResolutionQueue.on('ready', ()=>{
  console.log("BullMQ video Queue is Connected to Redis");
});

ResolutionQueue.on('error', (error)=>{
  console.log("BullMQ videoQueue connection Failed", error);
});

ResolutionQueue.on('disconnected', () => {
  console.log('BullMQ "videoQueue" has been disconnected from Redis.');
});