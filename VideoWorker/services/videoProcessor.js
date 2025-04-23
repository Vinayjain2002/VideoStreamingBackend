import axios from "axios";
import fs from 'fs';
import path from 'path';
import { uploadToS3 } from "../utils/s3Uploader.js";
import  videoQueue  from "../../VideoStorage/queues/VideoQueue.js";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import db from '../db.js';
import videoProcessingQueue from "../../VideoStorage/queues/VideoProcessingQueue.js";
import ResolutionProcessing from "../models/ResolutionSchema.js";
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const processVideo = async({ filename, s3Url, VideoID})=>{
    try{
        const response= await axios({
            method: "get",
            url: s3Url,
            responseType: "arraybuffer"
        });
        console.log("Get the File for the Processing into the Chunks", response);

        const videoBuffer = response.data;
        const tempDir = `video/${VideoID}`; 
        
        const tempFilePath = path.join(tempDir, filename);  
        const chunkDir= path.join(tempDir, 'chunk');

        if(!fs.existsSync(chunkDir)){
          fs.mkdirSync(chunkDir, {recursive: true});
        }

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true }); // Create directory if it does not exist
        }

        await fs.writeFileSync(tempFilePath, videoBuffer);
        console.log("File Is Written inside the ", tempFilePath);
        console.log("And the Directory of the File is defined as the ", tempDir);
        console.log("Video is Written");
        const chunkDuration= 5;

        console.log("Chunk Duration", chunkDuration);
        await new Promise((resolve, reject) => {
            ffmpeg(tempFilePath.replace(/\\/g, "/"))
            .outputOptions([
              `-f hls`,
              `-hls_time ${chunkDuration}`,
              `-hls_list_size 0`,
              `-hls_segment_filename`, `${tempDir.replace(/\\/g, "/")}/chunk/chunk-%03d.ts`
            ])
            .output(`${tempFilePath.replace(/\\/g, "/")}.m3u8`)
              .on('start',(commandLine)=>{
                console.log('FFmpeg process started with command:', commandLine);
            })
              .on('end', async () => {
                console.log("Video Split into the Chunks and HLS Playlist Generated");
          
                let chunkIndex = 1;
                const hlsChunk = [];
                
                
                while (fs.existsSync(`${tempDir}/chunk/chunk-${String(chunkIndex).padStart(3, '0')}.ts`)) {
                  console.log("The Chunk index is defined as the", chunkIndex);
                  const chunkFile = `${tempDir}/chunk/chunk-${String(chunkIndex).padStart(3, '0')}.ts`;
                  const uniqueChunkFilename = `${tempDir}/chunk/chunk-${chunkIndex}.ts`;
                  console.log(`Uploading Chunk: ${chunkFile}`);
                  const chunkBuffer = fs.readFileSync(chunkFile);
                  const chunkS3Url = await uploadToS3(uniqueChunkFilename, chunkBuffer);
                  console.log(`Chunk Uploaded to S3: ${chunkS3Url}`);
                  hlsChunk.push(`#EXTINF:${chunkDuration},\n${chunkS3Url}`);
                  chunkIndex++;

                  console.log("Adding the video to the Queue");
                  await videoProcessingQueue.add("VideoProcessingQueue", {
                   chunkS3Url,
                    VideoID,
                    chunkIndex
                    
                  });
                }
                
               
                await ResolutionProcessing.insertMany([
                  {
                    videoID: VideoID,
                    resolution: '360p',
                    expectedChunks: chunkIndex - 1
                  },
                  {
                    videoID: VideoID,
                    resolution: '720p',
                    expectedChunks: chunkIndex - 1
                  },
                  {
                    videoID: VideoID,
                    resolution: '1080p',
                    expectedChunks: chunkIndex - 1
                  }
                ]);
                
                console.log("the DATA OF THE cHUNKS IS DEFINED AS THE ", hlsChunk);
                const hlsFileContent = [
                  "#EXTM3U",
                  "#EXT-X-VERSION:3",
                  "#EXT-X-TARGETDURATION:20",
                  "#EXT-X-MEDIA-SEQUENCE:0",
                  ...hlsChunk,
                  "#EXT-X-ENDLIST"
                ].join('\n');
              
                const hlsPlaylistFilename = `video/${VideoID}_${filename}.m3u8`;
                
                const hlsOriginalFileS3URL = await uploadToS3(hlsPlaylistFilename, Buffer.from(hlsFileContent));

                console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
                console.log("Putting the Video in the Queue");
                console.log("./////////////////////////")
                console.log(s3Url)
                console.log(hlsOriginalFileS3URL);
                console.log("Video id is", VideoID);
                console.log(VideoID);
               
                console.log("Video Added in the Queu");
                await db.query(
                  `UPDATE videos SET hlsUrl = ? WHERE videoID = ?`,
                  [hlsOriginalFileS3URL, VideoID]
                );
                resolve();
              })
              .on('error', err => {
                console.log("Error Splitting Video:", err);
                reject(err);
              })
              .run();
          });
       
       console.log("Video Has Been Sent For the Processing");


    }
    catch(error){
        console.log("Processing Error:", error);
    }
}
