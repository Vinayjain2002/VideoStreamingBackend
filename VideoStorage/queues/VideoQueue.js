import { Queue } from "bullmq";
import {config} from 'dotenv';
import express from "express";

config();

 const videoQueue = new Queue("videoQueue", {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    }
  });
  
videoQueue.on('ready', ()=>{
  console.log("BullMQ video Queue is Connected to Redis");
});

videoQueue.on('error', (error)=>{
  console.log("BullMQ videoQueue connection Failed", error);
});
videoQueue.on('disconnected', () => {
  console.log('BullMQ "videoQueue" has been disconnected from Redis.');
});

export default videoQueue