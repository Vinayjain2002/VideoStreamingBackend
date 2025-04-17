import { Job, Worker } from "bullmq";
import dotenv from 'dotenv';
import cors from 'cors';
import { resoluteVideo } from './services/VideoResolutions.js';
import { ResoltionWorker } from "./Worker/ResolutionWorker.js";

dotenv.config();

const VideoProcessWorker= new Worker(
  "VideoProcessingQueue",
   async(Job)=>{
    console.log("Going to Chnage the Video To The Different Resolutions");
    await resoluteVideo(Job.data);
}, {
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    }
});

VideoProcessWorker.on("completed", (job) => {
    console.log(`Job completed: ${job.id}`);
  });
  
  VideoProcessWorker.on("failed", (job, err) => {
    console.error(`Job failed: ${job.id}`, err);
  });






// const app= express();
// app.use(express.json());
// app.use(cors());
// app.use(bodyParser.json({ limit: '500mb' })); // Adjust the limit as needed

// // Increase the limit for urlencoded payloads (if you are using them)
// app.use(bodyParser.urlencoded({ limit: '500mb', extended: true })); // Adjust the limit as needed


// app.use("/api/videos", videoRoutes);
// const PORT= process.env.PORT || 5002;

// app.listen(PORT, ()=>{
//     console.log(`Video Processing Running on Port: ${PORT}`);
// });
