import {Worker} from 'bullmq';
import {onlinUsers} from '../sockets/socket.js';
import dotenv from 'dotenv';

dotenv.config();

const notificationWorker= new Worker("notifications", async(job)=>{
    const {reciepent, sender, type, content, realTime}= job.data;

    if(realTime){
        users.forEach((userId) => {
            const socketId= onlinUsers.get(userId);
            if(socketId){
                io.to(socketId).emit("notification", {message});
            }
        });
    }
},
{connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
}}
);

notificationWorker.on("completed", (job)=>{
    console.log("Notification Send", job.id);
});

notificationWorker.on("failed", (job, err)=>{
    console.error(`Job Failed: ${job.id}`, err);
});