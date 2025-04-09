import express from "express";
import multer from "multer";
import { videoQueue } from "../queues/VideoQueue.js";
import { uploadToS3 } from "../utils/s3Uploader.js";
import { Video } from "../Models/VideoModal.js";

const router= express.Router();

const storage= multer.memoryStorage();
const upload= multer({storage: storage});

router.post("/", upload.single("video"), async(req, res)=>{
    try{
        if(!req.file){
            return res.status(400).json({"message": "No Video Is Uploaded"});
        }
     
    const filename= req.file.originalname;
    const fileBuffer= req.file.buffer;
    const fileSize= req.file.size;
    const fileFormat=  filename.split(".").pop();
    
    const s3Url=  await uploadToS3(filename, fileBuffer);
    console.log(`Enqueuing ${filename} for processing..`);
   
    await videoQueue.add("processVideo", {
        filename: req.file.originalname,
        s3Url
   });
      
    // saving the Data of the Files in the MetaData of the User
    const video= new Video({
        filename,
        originalS3Url: s3Url,
        size: fileSize,
        format: fileFormat
    })
    
        return res.status(200).json({"message": "Video uploaded and Added TO Queue", s3Url});
    }
    catch(err){
        console.log("Upload Error",err)
        return res.status(500).json({"message": "Internal Server Error"});
    }
})

export default router;
