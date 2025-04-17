import axios  from "axios";
import fs from 'fs';
import path from "path";
import { ResolutionQueue } from "../queue/queue.js";
/**
 * Downloads HLS chunks from S3 using .m3u8 file URL and processes them.
 * @param {string} m3u8Url - The URL to the HLS playlist (.m3u8).
 */

export const resoluteVideo= async({ s3Url,
    hlsOriginalFileS3URL,
    VideoID})=>{
    try{
        console.log("Downloading the File For the Resolutions of Videos, s3url:", s3Url);
        console.log("HLSURL: ", hlsOriginalFileS3URL);

        console.log("Fetching .m3u8 file...");
        const hlsplaylistResponse= await axios.get(hlsOriginalFileS3URL);
        const hlsplaylistContent= hlsplaylistResponse.data;

        console.log("HLS Data:", hlsplaylistContent);
        const chunkUrls = hlsplaylistContent
        .split("\n")
        .filter((line) => line.trim().endsWith(".ts"))
        .map((line) => (line.startsWith("http") ? line : baseUrl + line));

        console.log(`Found ${chunkUrls.length} chunks to download.`);

        for(let index=0; index< chunkUrls.length; index++ ){
            const chunkUrl= chunkUrls[index];
            const chunkIndex= index;

            console.log(`Streaming Chunk: ${chunkUrl} with ChunkIndex: ${chunkIndex}`);
           
            // Sending the Video for the Processing by Pushing into the Queue
            await ResolutionQueue.add("ResolutionQueue", {
                VideoID,
                chunkUrl,
                chunkIndex
            });
            console.log("Video Had Been Sent for the Changing of the Resolutions");
        }
    }
    catch{

    }
}