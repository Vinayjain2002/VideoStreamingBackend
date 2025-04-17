import express from "express";
import db from './config.js';
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/usersRoutes.js";
import usernameRoutes from "./routes/userNameRoutes.js";
import dotenv from 'dotenv';

dotenv.config();
const app= express();
app.use(express.json());

db.query("Select 1")
.then(()=> console.log("Database Connected Successfully"))
.catch(err => console.log("Database Connection Failed", err));

app.use("/api/v1", usernameRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1",userRoutes)

const PORT= process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server is Running on the Port ${PORT}`));