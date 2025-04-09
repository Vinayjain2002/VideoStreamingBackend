import express from 'express';
import fs from 'fs';
import path  from 'path';
import Video from '../Models/VideoModal.js';

const router= express.Router();
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
  
  // 📺 Serve HLS Video Chunks (.ts files)
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
  
  export default router;