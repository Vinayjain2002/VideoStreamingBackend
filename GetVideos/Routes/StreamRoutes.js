import express from 'express';
import axios from 'axios';
import Video from '../Models/VideoModal.js';

const router= express.Router();

const getBestQuality= (resolutions, quality)=>{
    if (quality) {
        // Try to return the requested quality if available
        const requestedQuality = resolutions.find((res) => res.resolution === quality);
        if (requestedQuality) return requestedQuality;
      }
      
      // Default: Select the highest available resolution
      return resolutions.sort((a, b) => parseInt(b.resolution) - parseInt(a.resolution))[0];
};

router.get("/stream/:videoID", async (req, res)=>{
    try{
        const {videoID}= req.params;
        const {quality, loaction}= req.query;

        const video= await Video.findById(videoID);
        if(!video){
            return res.status(404).json({"message": "Video Not Found"});
        }
        const selectedQuality= getBestQuality(video.resolutions, quality);  
        console.log(`🎥 Streaming Video: ${video.filename}, Quality: ${selectedQuality.resolution}`);

        const videoStream= await axios.get(selectedQuality.s3Url, {responseType: "stream"});

        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Transfer-Encoding", "chunked");

        // Pipe video stream to response
        videoStream.data.pipe(res);
    }
    catch{
        console.error("❌ Streaming Error:", error);
        res.status(500).json({ message: "Error Streaming Video" });
    }
});

export default router;