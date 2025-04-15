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

       await fs.writeFileSync(tempFilePath, videoBuffer);

         const form= new FormData();
         const newfilename= path.basename(tempFilePath);
         form.append('video', fs.createReadStream(tempFilePath), newfilename);
         
        console.log(`Sending the Video For the Processing, FileName: ${newfilename}`);
        const processResponse= await axios.post("http://localhost:5002/api/videos/process",form, {
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        });
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1");
        console.log("#################################");
        
        console.log(processResponse);

        const processedResolutions = [];
        const s3URLS= [];
      
        console.log(processResponse.status);
        console.log(processResponse);
        const processData= processResponse.data;
    //     // Saving the Data TO S3 for Each Resoultion

        // for(const resolution of processData.resolutions){
        //     const bufferData = Buffer.from(resolution.fileBuffer.data);
        //     const s3url=  await uploadToS3(resolution.filename, bufferData);
        //     s3URLS.push(s3url);

        //     const fileSize= Buffer.byteLength(resolution.fileBuffer);
        //     const fileFormat= resolution.filename.split(".").pop();
        //     console.log(fileSize);
        //     console.log(fileFormat);

        //     // processedResolutions.push({
        //     //     filename: resolution.filename,
        //     //     s3Url: s3url,
        //     //     size: fileSize,
        //     //     format: fileFormat,
        //     //     resolution: resolution.filename.match(/\d+p/)[0], // Extract resolution (e.g., 1080p)
        //     //   });
        //       console.log("File Data is Stored on the SSMS");
        // }
        // console.log("//////////////////////////////////////////")
        // console.log("File Uploaded Successfully");    
        // console.log(s3URLS);

        // await Video.findOneAndUpdate(
        //     { filename },
        //     { $set: { resolutions: processedResolutions } },
        //     { new: true }
        //   );
        // console.log("All the Files Uploaded to S3");

    }
    catch(error){
        console.log("Processing Error:", error);
    }
}
