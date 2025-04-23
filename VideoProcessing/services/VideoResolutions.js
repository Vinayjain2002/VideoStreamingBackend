import axios  from "axios";
import { processVideo } from "./videoProcessor.js";
/**
 * Downloads HLS chunks from S3 using .m3u8 file URL and processes them.
 * @param {string} m3u8Url - The URL to the HLS playlist (.m3u8).
 */


export const resoluteVideo= async({ chunkS3Url,
    VideoID,chunkIndex})=>{
    try{
        console.log(`Changing Resolution: ${VideoID} and ChunkUrl: ${chunkS3Url}`);
        // Step 1: Download the video chunk from S3 URL
        const response = await axios({
          method: "get",
          url: chunkS3Url,
          responseType: "arraybuffer", // Getting the buffer data
        });   


        const videoBuffer = Buffer.from(response.data);
        const fileName = `video/${VideoID}/chunk/chunk-${chunkIndex}.ts`; // You can customize how to name it

        console.log(`Video Chunk Downloaded: ${fileName}`);
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
        console.log("videoBuffer",videoBuffer)
        console.log("fileName", fileName);
        console.log("VideoID", VideoID);
        console.log("Chunk Index", chunkIndex);
        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
        // Step 3: Process the downloaded video chunk with the video buffer and file name

        console.log("Sending the Vide For the Processing");
        await processVideo(videoBuffer, fileName, VideoID, chunkIndex);
        
        console.log(`Resolution Changed for Video: ${VideoID}`);

    }
    catch{

    }
}