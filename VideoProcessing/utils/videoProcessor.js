import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from 'fs';
import path from "path";
import { uploadToS3 } from "./s3Uploader.js";
import db from '../Database/sql.js';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const processVideo = async (inputBuffer, filename, VideoID, ChunkIndex) => {
  console.log("Request has come for the Processing");

  try {
    const resolutions = [
      { name: "1080p", size: "1920x1080" },
      { name: "720p", size: "1280x720" },
      { name: "360p", size: "720x360" }
    ];
    
    const bufferSize = inputBuffer.length;
    let processedVideos = [];

    console.log("Going to run the Request for the Resolutions");

    // Use a 'for' loop to allow awaiting async operations
    for (const res of resolutions) {
      const outputFileName = `${res.name}_${filename}.mp4`;
      const outputPath = path.join("temp", outputFileName);
      const tempInputPath = path.join("temp", filename);
      
      console.log("Going to Write to the File");
      fs.writeFileSync(tempInputPath, inputBuffer);

      try {
        await new Promise((resolve, reject) => {
          ffmpeg(tempInputPath)
            .outputOptions([
              "-crf 35", // Reduces quality (higher means worse quality)
              "-b:v 500k", // Limits video bitrate
              "-preset ultrafast", // Fast encoding
            ])
            .size(res.size)
            .output(outputPath)
            .on("end", async () => {
              try {
                const fileBuffer = fs.readFileSync(outputPath);
                const ChunkS3Url = await uploadToS3(outputFileName, fileBuffer);

                // Insert into the database
                await db.query(
                  `INSERT INTO video_chunks (videoID, resolution, chunkIndex, chunkFilePath, chunkSize, processingStatus) 
                  VALUES (?, ?, ?, ?, ?, ?)`,
                  [
                    VideoID,
                    res.name,   // Resolution name (e.g., '1080p')
                    ChunkIndex,
                    ChunkS3Url,  // S3 URL for the chunk
                    bufferSize,  // Video size in bytes
                    'ready'      // Status of the chunk
                  ]
                );

                processedVideos.push({ filename: outputFileName, fileBuffer });

                if (processedVideos.length === resolutions.length) {
                  resolve(processedVideos); // Resolve when all resolutions are processed
                }

              } catch (err) {
                console.error("Error in Processing the Video:", err);
                reject(err);
              }
            })
            .on("error", (err) => reject(err))
            .run();
        });
      } catch (err) {
        console.error("Error processing resolution:", err);
      }
    }
  } catch (error) {
    console.error("Error in Processing the Video", error);
    throw error;
  }
};


