import {Worker} from 'bullmq';
import redisConnection from '../config/Redis';
import {onlinUsers} from '../sockets/socket.js'

new Worker("notifications", async(job)=>{
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
{connection: redisConnection}
);

console.log("Worker Started, Listening For the Jobs");