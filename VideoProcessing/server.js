import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import videoRoutes from './routes/processingRoutes.js';
import bodyParser from 'body-parser'; // Import the body-parser module
dotenv.config();

const app= express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: '500mb' })); // Adjust the limit as needed

// Increase the limit for urlencoded payloads (if you are using them)
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true })); // Adjust the limit as needed


app.use("/api/videos", videoRoutes);
const PORT= process.env.PORT || 5002;

app.listen(PORT, ()=>{
    console.log(`Video Processing Running on Port: ${PORT}`);
});
