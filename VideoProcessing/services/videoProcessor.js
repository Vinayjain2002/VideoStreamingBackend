import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs, { chownSync } from 'fs';
import path from "path";
import { uploadToS3 } from "./s3Uploader.js";
import db from '../Database/sql.js';
import ChunkProcessing from "../../VideoWorker/models/chunkProcessingSchema.js";
import ResolutionProcessing from "../../VideoWorker/models/ResolutionSchema.js";
import { M38Queue } from "../queue/M3U8Queue.js";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const processVideo = async (inputBuffer, filename, VideoID, ChunkIndex) => {
  console.log("Request has come for the Processing");
  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
  console.log("inputBuffer", inputBuffer);
  console.log("Filename", filename);
  console.log("VideoID", VideoID);
  console.log("Chunk Index", ChunkIndex);
  console.log("/////////////////////////////////////////////////")

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
      console.log(res);
      console.log(res.name);
      const outputFileName = `temp/video/${VideoID}/chunk/chunk-${ChunkIndex}.ts`;
      const readFileName= `temp/video/${VideoID}/chunk/chunk-${ChunkIndex}.ts`;
      const tempInputPath = path.join("temp", filename);
      console.log(tempInputPath);
      
      const inputDir = path.dirname(tempInputPath);
      fs.mkdirSync(inputDir, { recursive: true });
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
            .output(outputFileName)
            .on("end", async () => {
              try {
                const fileBuffer = fs.readFileSync(readFileName);
                const ChunkS3Url = await uploadToS3(outputFileName, fileBuffer);
                await ChunkProcessing.create({
                  videoID: VideoID,
                  resolution: res.name,
                  chunkIndex: ChunkIndex,
                  chunkS3Url: ChunkS3Url,
                  processed: true
                });
                
                
                const updatedResolutionProcessing = await ResolutionProcessing.findOneAndUpdate(
                  { videoID: VideoID, resolution: res.name },
                  {
                    $inc: { uploadedChunks: 1 },
                    $push: { chunksS3Urls: ChunkS3Url }
                  },
                  { new: true } // returns the updated document
                );
                

                // Trying to Get is the No of the Chunks Exactly Matched
                const resolutedChunks= await ResolutionProcessing.findOne({videoID: VideoID, resolution: res});
                if(resolutedChunks.expectedChunks== resolutedChunks.uploadedChunks){
                  // We need to Add the Element in the Queue of the M3U8 one
                  await M38Queue.add("M38Queue", {
                    VideoID: VideoID,
                    resolution: res.name,
                    S3Urls:  resolutedChunks.chunksS3Urls
                  });
                }
                console.log(updatedResolutionProcessing);
                
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

        console.log("Different Resolutions Video Had Been Saved Successfully");
      } catch (err) {
        console.error("Error processing resolution:", err);
      }
    }
  } catch (error) {
    console.error("Error in Processing the Video", error);
    throw error;
  }
};


