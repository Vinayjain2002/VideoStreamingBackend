import express from 'express';
import http from 'http';
import { connectDB } from './config/mongoDB.js';
import redisConnection from './config/Redis.js';
import notificationRoutes from './routes/notificationRoutes.js';
import {setUpSocket} from './sockets/socket.js'

connectDB();
redisConnection();

const app= express();
const Server= http.createServer(app);
const io= new Server(Server);

app.use("/api/notification", notificationRoutes);
setUpSocket(io);

Server.listen(process.env.PORT, ()=>{
    console.log("Server is Listening on Port", process.env.PORT);
});