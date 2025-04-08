import express from "express";
import dotenv from "dotenv";
import uploadRouter from "./routes/upload.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/upload/video", uploadRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Video Storage Service running on port ${PORT}`));
