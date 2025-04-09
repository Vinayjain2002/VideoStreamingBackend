import express from 'express';
import fs from 'fs';
import path  from 'path';
import Video from '../Models/VideoModal.js';

const router= express.Router();

/**
 * 🎥 Serve HLS Master Playlist (master.m3u8)
 * This returns the master playlist containing different quality levels
 */
router.get("/hls/:videoId/master.m3u8", async (req, res) => {
    try {
      const { videoId } = req.params;
      const video = await Video.findById(videoId);
      if (!video) return res.status(404).json({ message: "Video not found" });
  
      // Generate HLS Playlist dynamically
      let playlist = "#EXTM3U\n";
      for (const resolution of video.resolutions) {
        playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${resolution.size},RESOLUTION=${resolution.resolution}\n`;
        playlist += `/hls/${videoId}/${resolution.resolution}.m3u8\n`;
      }
  
      res.setHeader("Content-Type", "application/x-mpegURL");
      res.send(playlist);
    } catch (error) {
      console.error("❌ HLS Playlist Error:", error);
      res.status(500).json({ message: "Error Generating HLS Playlist" });
    }
  });
  
/**
 * 📺 Serve HLS Variant Playlist (resolution.m3u8)
 * This serves the `.m3u8` file that contains a list of `.ts` chunks for a specific resolution.
 */  
  router.get("/hls/:videoId/:resolution.m3u8", async (req, res) => {
    try {
      const { videoId, resolution } = req.params;
      const video = await Video.findById(videoId);
      if (!video) return res.status(404).json({ message: "Video not found" });
  
      const selectedQuality = video.resolutions.find((res) => res.resolution === resolution);
      if (!selectedQuality) return res.status(404).json({ message: "Resolution not found" });
  
      res.setHeader("Content-Type", "application/x-mpegURL");
      res.redirect(selectedQuality.s3Url); // Redirect to actual HLS playlist
    } catch (error) {
      console.error("❌ HLS Streaming Error:", error);
      res.status(500).json({ message: "Error Streaming HLS Video" });
    }
  });

  
/**
 * 🎬 Serve HLS Video Chunks (.ts files)
 * This serves the actual video chunks in a streaming fashion.
 */
router.get("/hls/:videoId/:resolution/:segment.ts", async (req, res) => {
  try {
    const { videoId, resolution, segment } = req.params;
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const selectedQuality = video.resolutions.find((res) => res.resolution === resolution);
    if (!selectedQuality) return res.status(404).json({ message: "Resolution not found" });

    const s3SegmentUrl = `${selectedQuality.s3Url.replace("master.m3u8", segment + ".ts")}`; // Adjust URL to fetch .ts file

    // Stream `.ts` chunk from S3
    const videoStream = await axios.get(s3SegmentUrl, { responseType: "stream" });

    res.setHeader("Content-Type", "video/mp2t");
    videoStream.data.pipe(res);
  } catch (error) {
    console.error("❌ HLS Chunk Streaming Error:", error);
    res.status(500).json({ message: "Error Streaming HLS Chunk" });
  }
});

  
  export default router;



//   📌 Example Requests
// Get the Master Playlist
// http
// Copy code
// GET /hls/65a12345b6789cdeff000001/master.m3u8
// Get the 1080p Playlist
// http
// Copy code
// GET /hls/65a12345b6789cdeff000001/1080p.m3u8
// Get a Specific Video Chunk
// http
// Copy code
// GET /hls/65a12345b6789cdeff000001/1080p/segment1.ts