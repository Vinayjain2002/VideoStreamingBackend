const Notification= require("../models/NotificationModel.js")
const {Queue}= require('bullmq');
const { default: redisConnection } = require("../config/Redis.js");


const notificationQueue= new Queue("notifications", {connection: redisConnection});

const sendNotification= async(req,res)=>{
    try{
        const {reciepent, type,content, realTime }= req.body;
        const sender= "1";
        const newNotification= await Notification.create({reciepent: reciepent,sender: sender, type: type, content: content, realTime: realTime });
        if(newNotification <= 0){
            return res.status(500).json({"message": "Error While Saving Notitication", success: false});
        }
        await notificationQueue.add("sendNotification", {reciepent, sender, type, content, realTime});
        return res.status(200).json({"message": "Notification Had Been Send"});
    }
    catch(error){
        res.status(500).json({"message": "Error While Sending the Notification", success: false});
    }
}
export default sendNotification;
