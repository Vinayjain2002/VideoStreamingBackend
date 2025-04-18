import { Queue } from "bullmq";
import {config} from 'dotenv';
import express from "express";

config();

 const videoProcessingQueue = new Queue("VideoProcessingQueue", {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    }
  });
  
videoProcessingQueue.on('ready', ()=>{
  console.log("BullMQ video Queue is Connected to Redis");
});

videoProcessingQueue.on('error', (error)=>{
  console.log("BullMQ videoQueue connection Failed", error);
});

videoProcessingQueue.on('disconnected', () => {
  console.log('BullMQ "videoQueue" has been disconnected from Redis.');
});

export default videoProcessingQueue;