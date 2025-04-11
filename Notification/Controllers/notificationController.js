import Notification from "../models/NotificationModel.js";
import {Queue} from 'bullmq';
import {config} from 'dotenv';

config();

 const notificationQueue= new Queue("notifications", {connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
}});

const sendNotification= async(req,res)=>{
    try{
        console.log(req.body);
        const {reciepent, type,content, realTime }= req.body;
        console.log(reciepent, type, content, realTime);
        const sender= "1";
        // const newNotification= await Notification.create({reciepent: reciepent,sender: sender, type: type, content: content, realTime: realTime });
        // if(newNotification <= 0){
        //     return res.status(500).json({"message": "Error While Saving Notitication", success: false});
        // }
        await notificationQueue.add("sendNotification", {reciepent, sender,type,content, realTime});
        console.log("Added the Notification in the Queue");
        return res.status(200).json({"message": "Notification Had Been Send"});
    }
    catch(error){
        res.status(500).json({"message": "Error While Sending the Notification", success: false});
    }
}
export default sendNotification;
