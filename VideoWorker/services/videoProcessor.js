import axios from "axios";
import fs from 'fs';
import path from 'path';
import { uploadToS3 } from "../utils/s3Uploader.js";
import FormData from 'form-data';
import { Video } from "../models/VideoSchema.js";
import Ffmpeg from "fluent-ffmpeg";
import { buffer } from "stream/consumers";
import { videoQueue } from "../../VideoStorage/queues/VideoQueue.js";

export const processVideo = async({ filename, s3Url, VideoID})=>{
    try{
        console.log(`Downloading ${filename} from s3...`);
        
        const response= await axios({
            method: "get",
            url: s3Url,
            responseType: "stream"
        });
        console.log(response);
        const videoBuffer = response.data;
        const tempDir = "temp"; 
        const tempFilePath = path.join(tempDir, filename);

        // Ensure directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true }); // Create directory if it does not exist
        }

        await fs.writeFileSync(tempFilePath, videoBuffer);
        const chunkDuration= 20;

        const hlsChunk= [];

        Ffmpeg(tempFilePath).outputOptions([
            `-f hls`,
            `-hls_time ${chunkDuration}`, // Chunk duration in seconds
            `-hls_list_size 0`, // Include all chunks in the playlist
            `-hls_segment_filename ${tempDir}/chunk-%03d.ts` // 
        ]).on('end', async ()=>{
            console.log("Video Split into the Chunks and HLS Playlist Genetated");
            
        let chunkIndex= 1;
        while(fs.existsSync(`${tempDir}/chunk-${String(chunkIndex).padStart(3, '0')}.ts`)){
            const chunkFile=  `${tempDir}/chunk-${String(chunkIndex).padStart(3, '0')}.ts`;
                      // Generate a unique filename for each chunk
          const uniqueChunkFilename = `${uuidv4()}.ts`;

          console.log(`Uploading Chunk: ${chunkFile}`);
          const chunkBuffer= fs.readFileSync(chunkFile);
          const chunkS3Url= await uploadToS3(uniqueChunkFilename, chunkBuffer);

          console.log(`Chunk Uploaded to S3: ${chunkS3Url}`);

          hlsChunk.push(`#EXTINF:${chunkDuration},\n${chunkS3Url}`);
          fs.unlink(chunkFile);
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

          const hlsOriginalFileS3URL= await uploadToS3(hlsPlaylistFilename,Buffer.from(hlsFileContent));
          await db.query(
            `UPDATE videos SET hlsUrl = ? WHERE videoID = ?`,
            [hlsOriginalFileS3URL, VideoID]
          );          
          console.log("HLS Playlist Uploaded To S3");

          console.log("HLS Playlist info saved in database");
          
        }).on('error', (err)=>{
            console.log("Error Splitting Video:", err);
        }).run();
          
        await videoQueue.add("VideoProcessingQueue", {
            s3Url,
            hlsOriginalFileS3URL,
            VideoID
       });        
         
       console.log("Video Has Been Sent For the Processing");













       
        //  const form= new FormData();
        //  const newfilename= path.basename(tempFilePath);
        //  form.append('video', fs.createReadStream(tempFilePath), newfilename);
         
        // console.log(`Sending the Video For the Processing, FileName: ${newfilename}`);
        // const processResponse= await axios.post("http://localhost:5002/api/videos/process",form, {
        //   maxBodyLength: Infinity,
        //   maxContentLength: Infinity
        // });
      
        // console.log(processResponse);

        // const processedResolutions = [];
        // const s3URLS= [];
      
        // console.log(processResponse.status);
        // console.log(processResponse);
        // const processData= processResponse.data;



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
      
    }
    catch(error){
        console.log("Processing Error:", error);
    }
}
