import axios from "axios";
import fs from 'fs';
import path from 'path';
import { uploadToS3 } from "../utils/s3Uploader.js";
import FormData from 'form-data';
import { Video } from "../models/VideoSchema.js";

export const processVideo = async({ filename, s3Url})=>{
    try{
        console.log(`Downloading ${filename} from s3...`);

        const response= await axios.get(s3Url, {responseType: "arraybuffer"});
        console.log(response);
        const videoBuffer = response.data;
        const tempDir = "temp"; 
        const tempFilePath = path.join(tempDir, filename);

        // Ensure directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true }); // Create directory if it does not exist
        }

        console.log("Saving File");
       await fs.writeFileSync(tempFilePath, videoBuffer);
         console.log(tempFilePath);

         const form= new FormData();
         const newfilename= path.basename(tempFilePath);
         form.append('video', fs.createReadStream(tempFilePath), newfilename);
         
        console.log(`Sending the Video For the Processing, FileName: ${newfilename}`);
        const processResponse= await axios.post("http://localhost:5002/api/videos/process",form, {
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        });
        
    //     //Data after Changing into the Different Formats ie in the Different Video Quality
        const processedResolutions = [];
        console.log(processResponse.status);
        console.log(processResponse);
        // const processData= processResponse.data;
    //     // Saving the Data TO S3 for Each Resoultion

    //     for(const resolution of processData.resolutions){
    //         await uploadToS3(resolution.filename, resolution.fileBuffer);
    //         const fileSize= Buffer.byteLength(resolution.fileBuffer);
    //         const fileFormat= resolution.filename.split(".").pop();
    //         processedResolutions.push({
    //             filename: resolution.filename,
    //             s3Url: s3ProcessedUrl,
    //             size: fileSize,
    //             format: fileFormat,
    //             resolution: resolution.filename.match(/\d+p/)[0], // Extract resolution (e.g., 1080p)
    //           });
    //     }

    //     await Video.findOneAndUpdate(
    //         { filename },
    //         { $set: { resolutions: processedResolutions } },
    //         { new: true }
    //       );
    //     console.log("All the Files Uploaded to S3");

    }
    catch(error){
        console.log("Processing Error:", error);
    }
}
