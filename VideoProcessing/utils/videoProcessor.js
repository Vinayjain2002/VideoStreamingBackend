import ffmpeg from "fluent-ffmpeg";
import fs from 'fs'
import path from "path";

export const processVideo= async (inputBuffer, filename)=>{
  console.log("Request has come for the Processing");
    return new Promise((resolve, reject)=>{
        const resolutions = [
            { name: "1080p", size: "1920x1080" },
            { name: "720p", size: "1280x720" },
            {name: "360p", size: "720x360"}
          ];

          let processedVideos = [];
          console.log("Going to run the Request for the Resolutions");
          resolutions.forEach((res)=>{
            const outputFileName= `video_${res.name}.mp4`;
            
            const outputPath= path.join("temp", outputFileName);

            const tempInputPath= path.join("temp", filename);
            console.log("Going to Write to the File");
            fs.writeFileSync(tempInputPath, inputBuffer);

            ffmpeg(tempInputPath)
            .size(res.size)
            .output(outputPath)
            .on("end", () => {
              const fileBuffer = fs.readFileSync(outputPath);
              processedVideos.push({ filename: outputFileName , fileBuffer });
    
              if (processedVideos.length === resolutions.length) {
                resolve(processedVideos);
              }
            })
            .on("error", (err) => reject(err))
            .run();
        });
    });

    
}