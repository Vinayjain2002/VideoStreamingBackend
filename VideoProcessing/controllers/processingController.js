import { processVideo } from "../utils/videoProcessor.js";

export const processVideoHandler = async(req, res)=>{
    try{
        if(!req.file){
            return res.status(400).json({"message": "No video file Uploaded"});
        }
        console.log("req has come")
        console.log(req.file);
       const buffer= req.file.buffer;
       const filename= req.file.originalname;
       console.log("filename !!!!", filename);
       console.log("buffer", buffer);
        const processedVideos= await processVideo(buffer, filename);
        console.log("Video Processsing Part is Done Successfully");
        console.log(processedVideos);
        return res.json({resolutions: processedVideos});
         }
    catch(error){
        console.log("Error Processing Videos", error);
        res.status(500).json({ error: "Video processing failed" });
    }   
}