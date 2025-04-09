import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {connectDB} from './db.js';
import streamRoutes from './Routes/StreamRoutes.js';
import hlsRoutes from './Routes/hlsRoutes.js';

dotenv.config();
connectDB();

const app= express();
app.use(express.json());
app.use(cors());

app.use("/api/videos", streamRoutes);
app.use("/api/videos", hlsRoutes);

const PORT= process.env.PORT || 5003;

app.listen(PORT , ()=>{
    console.log("Video Streaming Server Running on PORT", PORT);
});
