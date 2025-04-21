import express from "express";
import multer from "multer";
import videoQueue from '../queues/VideoQueue.js';
import { uploadToS3 } from "../utils/s3Uploader.js";
import authMiddleware from "../Middleware/authmiddleware.js";
import db from '../Database/sql.js';
const router= express.Router();
import { v4 as uuidv4 } from "uuid";
const storage= multer.memoryStorage();
const upload= multer({storage: storage});

router.post("/", authMiddleware,upload.single("video"), async(req, res)=>{
    try{
        
        if(!req.file){
            return res.status(400).json({"message": "No Video Is Uploaded"});
        }
        console.log(req.body);
        
        const {userID, title, description, duration, privacyStatus, categoryID} = req.body;
        
        const intuserID = parseInt(userID, 10); // 10 is the radix (base)
        

    const filename= req.file.originalname;
    const fileBuffer= req.file.buffer;
    const fileSize= req.file.size;
    const fileFormat=  filename.split(".").pop();
    console.log(filename, fileBuffer, fileSize, fileFormat);
    
    const uniqueName = `${uuidv4()}_${filename}`;
    console.log("The Unique File Name is Defined as the ", uniqueName);
    const s3Url=  await uploadToS3(uniqueName, fileBuffer);
    console.log(`Enqueuing ${uniqueName} for processing..`);
    
    // We are gonna to Add the Video Data into the Table
        const [result] = await db.query(
            `INSERT INTO videos (uploaderID, title, description, duration, privacyStatus, categoryID, s3Url, videoSize) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [intuserID, title, description, duration, privacyStatus, categoryID, s3Url, fileSize]
          );
          const VideoID= result.insertId;
          console.log("Video Uploaded In the Sql Database");
          console.log(VideoID);
           
          await videoQueue.add("processVideo", {
            filename: uniqueName,
            s3Url,
            VideoID
       });       
       console.log("Video Uploaded in the Queue", videoQueue);  
        return res.status(200).json({"message": "Video uploaded and Added TO Queue", s3Url});
    }
    catch(err){
        console.log("Upload Error",err)
        return res.status(500).json({"message": "Internal Server Error"});
    }
})

export default router;
