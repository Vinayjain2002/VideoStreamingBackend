import axios from "axios";
import fs from 'fs';
import path from 'path';
import { uploadToS3 } from "../utils/s3Uploader.js";

export const processVideo = async({ filename, s3Url})=>{
    try{
        console.log(`Downloading ${filename} from s3...`);

        const response= await axios.get(s3Url, {responseType: "arraybuffer"});
        const videoBuffer = response.data;
        
        const tempFilePath = path.join("/tmp", filename);
        fs.writeSync(tempFilePath, videoBuffer);

        console.log(`Sending the Video For the Processing, FileName: ${filename}`);
        const processResponse= await axios.post("http://videoprocessing-service:4000/process", {
            filename,
            fileBuffer: videoBuffer
        });
        //Data after Changing into the Different Formats ie in the Different Video Quality

        const processData= processResponse.data;
        // Saving the Data TO S3 for Each Resoultion

        for(const resolution of processData.resolutions){
            await uploadToS3(resolution.filename, resolution.fileBuffer);
        }

        console.log("All the Files Uploaded to S3");

    }
    catch(error){
        console.log("Processing Error:", error);
    }
}


// Expected Output of the S3 
// {
//     "resolutions": [
//       {
//         "filename": "video_1080p.mp4",
//         "fileBuffer": "<processed binary data>"
//       },
//       {
//         "filename": "video_720p.mp4",
//         "fileBuffer": "<processed binary data>"
//       }
//     ]
//   }
  


// This microservice is responsible for processing uploaded videos, including:

// Compression – Reducing file size.

// Resolution Adjustments – Creating multiple resolutions (e.g., 1080p, 720p, 480p).

// Format Conversion – Converting videos into compatible formats like .mp4, .webm.

// Chunking – Splitting videos for adaptive streaming (e.g., HLS streaming).

// Returning Processed Data – Sending processed files back to be uploaded to AWS S3.