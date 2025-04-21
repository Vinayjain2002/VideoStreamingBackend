import {Worker} from 'bullmq';
import dotenv from 'dotenv';
import sendEmail from './config/nodeMailerConfig.js';

dotenv.config();

const NotificationWorker= new Worker("NotificationQueue",async(job)=>{
    const data= job.data;
    switch(data.type){
        case 'email':
            await sendEmail(data.to, data.subject, data.htmlBody);
            break;
        case 'push':
            console.log("Sending the Push Notification");
            break;
        case 'socket':  
            console.log("Sending the Socket Messages");
            break;
        default:
            console.log("Please select a Valid Notification Type");
    }
}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    }
});

NotificationWorker.on("ready", () => {
    console.log("Worker Node is Ready To Listen to the Notifications");
    console.log("✅ Worker is ready and connected to Redis!");
  });
  
  NotificationWorker.on("error", (err) => {
    console.error("❌ Worker connection error:", err);
  });
  
