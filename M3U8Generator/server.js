import {Worker} from 'bullmq';
import dotenv from 'dotenv';
import { connectDB } from './connectDB.js';
import { processM3U8File } from './Service/ProcessM3U8File.js';

dotenv.config();
connectDB();


const M3U8Worker= new Worker("M38Queue", async(job)=>{
    await processM3U8File(job.data);
}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    }
});

M3U8Worker.on("completed",(job)=>{
    console.log(`Job Completed: ${job.id}`);
});

M3U8Worker.on('failed', (job, err)=>{
    console.error(`Job Error: ${job.id}`, err);
});
