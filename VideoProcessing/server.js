import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import videoRoutes from './routes/processingRoutes.js';
dotenv.config();

const app= express();
app.use(express.json());
app.use(cors());

app.use("/api/videos", videoRoutes);
const PORT= process.env.PORT || 5002;

app.listen(PORT, ()=>{
    console.log(`Video Processing Running on Port: ${PORT}`);
});