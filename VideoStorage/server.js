import express from "express";
import dotenv from "dotenv";
import db from './Database/sql.js';
import uploadRoute from './routes/upload.js';
import { connectDB } from "./Database/db.js";

dotenv.config();
db.query("Select 1")
.then(()=> console.log("MySQL Database Connected Successfully"))
.catch(err => console.log("Database Connection Failed", err));

const app = express();
connectDB();

app.use(express.json());
app.use("/upload/video", uploadRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Video Storage Service running on port ${PORT}`));