import axios from "axios";
import fs from 'fs';
import path from 'path';
import { uploadToS3 } from "../utils/s3Uploader.js";
import FormData from 'form-data';
import { Video } from "../models/VideoSchema.js";
import { buffer } from "stream/consumers";
import  videoQueue  from "../../VideoStorage/queues/VideoQueue.js";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import videoProcessingQueue from "../../VideoStorage/queues/VideoProcessingQueue.js";
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const processVideo = async({ filename, s3Url, VideoID})=>{
    try{
        
        const response= await axios({
            method: "get",
            url: s3Url,
            responseType: "arraybuffer"
        });
        

        const videoBuffer = response.data;
        const tempDir = "temp"; 
        const tempFilePath = path.join(tempDir, filename);

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true }); // Create directory if it does not exist
        }

        await fs.writeFileSync(tempFilePath, videoBuffer);
        console.log("Video is Written");
        const chunkDuration= 5;

        console.log("Chunk Duration", chunkDuration);
        await new Promise((resolve, reject) => {
            ffmpeg(tempFilePath)
              .outputOptions([
                `-f hls`,
                `-hls_time ${chunkDuration}`,
                `-hls_list_size 0`,
                `-hls_segment_filename ${tempDir}/chunk-%03d.ts`
              ])
              .output(`${tempFilePath}.m3u8`)
              .on('start',(commandLine)=>{
                console.log('FFmpeg process started with command:', commandLine);
            }).on('progress', (progress)=>{
                console.log("Processing:"+ progress.percent +'% done');
            })
              .on('end', async () => {
                console.log("Video Split into the Chunks and HLS Playlist Generated");
          
                let chunkIndex = 1;
                const hlsChunk = [];
                console.log("Checking chunks in the tempDir:", fs.readdirSync(tempDir));

                while (fs.existsSync(`${tempDir}/chunk-${String(chunkIndex).padStart(3, '0')}.ts`)) {
                  const chunkFile = `${tempDir}/chunk-${String(chunkIndex).padStart(3, '0')}.ts`;
                  const uniqueChunkFilename = `${uuidv4()}.ts`;
                  console.log(`Uploading Chunk: ${chunkFile}`);
                  const chunkBuffer = fs.readFileSync(chunkFile);
                  const chunkS3Url = await uploadToS3(uniqueChunkFilename, chunkBuffer);
                  console.log(`Chunk Uploaded to S3: ${chunkS3Url}`);
                  hlsChunk.push(`#EXTINF:${chunkDuration},\n${chunkS3Url}`);
                  chunkIndex++;

                   
                }
          
                const hlsFileContent = [
                  "#EXTM3U",
                  "#EXT-X-VERSION:3",
                  "#EXT-X-TARGETDURATION:20",
                  "#EXT-X-MEDIA-SEQUENCE:0",
                  ...hlsChunk,
                  "#EXT-X-ENDLIST"
                ].join('\n');
              
                const hlsPlaylistFilename = `${uuidv4()}_${filename}.m3u8`;
                
                const hlsOriginalFileS3URL = await uploadToS3(hlsPlaylistFilename, Buffer.from(hlsFileContent));

                console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
                console.log("Putting the Video in the Queue");
                console.log("./////////////////////////")
                console.log(s3Url)
                console.log(hlsOriginalFileS3URL);
                console.log("Video id is", VideoID);
                console.log(VideoID);
                await videoProcessingQueue.add("VideoProcessingQueue", {
                  s3Url: s3Url,
                  hlsOriginalFileS3URL,
                  VideoID
                  
                });
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
          
          
    //   
       console.log("Video Has Been Sent For the Processing");


    }
    catch(error){
        console.log("Processing Error:", error);
    }
}
