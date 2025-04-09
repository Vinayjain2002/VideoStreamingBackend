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
        const range= req.headers.range;
        if(!range){
            return res.status(400).json({"message": "Range Header Required"});
        }

        const {quality, loaction}= req.query;

        const video= await Video.findById(videoID);
        if(!video){
            return res.status(404).json({"message": "Video Not Found"});
        }

        const selectedQuality= getBestQuality(video.resolutions, quality);  
        console.log(`🎥 Streaming Video: ${video.filename}, Quality: ${selectedQuality.resolution}`);
        const s3Url = selectedQuality.s3Url; // The S3 URL for the requested video resolution

         // 📏 Parse Range Header (e.g., "bytes=100000-")
        const rangeParts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(rangeParts[0], 10);
        const end = rangeParts[1] ? parseInt(rangeParts[1], 10) : undefined;

        // 🏗 Fetch Video Stream from S3
        const headers = { Range: `bytes=${start}-${end || ""}` };
        const videoStream = await axios.get(s3Url, {
        headers,
        responseType: "stream",
        });

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end || "*"}/${videoStream.headers["content-length"]}`,
            "Accept-Ranges": "bytes",
            "Content-Length": videoStream.headers["content-length"],
            "Content-Type": "video/mp4",
          });
      
          videoStream.data.pipe(res); // 🔄 Stream from S3 to the user
    }
    catch{
        console.error("❌ Streaming Error:", error);
        res.status(500).json({ message: "Error Streaming Video" });
    }
});

export default router;