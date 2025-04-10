import { processVideo } from "../utils/videoProcessor.js";

export const processVideoHandler = async(req, res)=>{
    try{
        if(!req.file){
            return res.status(400).json({"message": "No video file Uploaded"});
        }
        console.log("req has come")
        console.log(req.file);
       const buffer= req.file.buffer;
       const filename= req.file.filename;
        const processedVideos= await processVideo(videoBuffer, filename);
        // return res.json({resolutions: processedVideos});
        return res.status(200).json({"message": "Video Processed Successfully"});
    }
    catch(error){
        console.log("Error Processing Videos", error);
        res.status(500).json({ error: "Video processing failed" });
    }   
}