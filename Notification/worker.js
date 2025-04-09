import { Worker } from "bullmq";
import { redisClient } from "./config/redisConfig.js";
import { sendPushNotification, sendSocketNotification,isUserOnline } from "./services/NotificationService.js";

const notificationWorker= new Worker("notifications", async(job)=>{
    const {users, message}= job.data;
    for (const userID of users){
        const online= await isUserOnline(userID);

        if(online){
            await sendSocketNotification(userID, message);
            console.log("Socket Notification Send to the User", userID);
        }
        else{
            await sendPushNotification(userID, message);
            console.log("Push Notification Queued For the User", userID);
        }
    }
}, {
    connection: redisClient
});

console.log("Notification Worker Started");