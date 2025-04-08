import { processVideo } from "../utils/videoProcessor";

export const processVideoHandler = async(req, res)=>{
    try{
        const videoBuffer= req.file.buffer;
        const filename= req.file.originalname;

        console.log(`Processing Video ${filename}`);
        const processedVideos= await processVideo(videoBuffer, filename);
        return res.json({resolutions: processedVideos});
    }
    catch(error){
        console.log("Error Processing Videos", error);
        res.status(500).json({ error: "Video processing failed" });
    }   
}