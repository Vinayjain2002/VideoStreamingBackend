import {Worker} from 'bullmq';
import socketModule from '../sockets/socket.js';
const {setUpSocket, onlineUsers} = socketModule;
import dotenv from 'dotenv';
dotenv.config();

const notificationWorker= new Worker("notifications", async(job)=>{

    console.log("New Notification Fetched from the Queue");

    console.log(job.data);
    const {reciepent, sender, type, content, realTime}= job.data;
    console.log("!!!!!!!!!!!!!!!!!!!!1");
    console.log(reciepent, sender, type, content, realTime);
    if(realTime){
        reciepent.forEach((userId) => {
         
            console.log(onlineUsers);
            const socketId= onlineUsers.get(userId);
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