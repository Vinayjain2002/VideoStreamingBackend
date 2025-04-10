import { processVideo } from "../utils/videoProcessor.js";

export const processVideoHandler = async(req, res)=>{
    try{
        console.log("req has come")
        console.log(req.file);
        const videoBuffer= req.file.buffer;
        const filename= req.file.originalname;

        console.log(`Processing Video ${filename}`);
        console.log("file Data is Defined as the ", videoBuffer);
        // const processedVideos= await processVideo(videoBuffer, filename);
        // return res.json({resolutions: processedVideos});
        return res.status(200).json({"message": "Video Processed Successfully"});
    }
    catch(error){
        console.log("Error Processing Videos", error);
        res.status(500).json({ error: "Video processing failed" });
    }   
}