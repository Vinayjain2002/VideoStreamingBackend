import { Queue } from "bullmq";
import dotenv from 'dotenv';
dotenv.config();

export const M38Queue= new Queue("M38Queue", {
    connection:{
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    }
});

  
M38Queue.on('ready', ()=>{
  console.log("BullMQ video Queue is Connected to Redis");
});

M38Queue.on('error', (error)=>{
  console.log("BullMQ videoQueue connection Failed", error);
});

M38Queue.on('disconnected', () => {
  console.log('BullMQ "videoQueue" has been disconnected from Redis.');
});