import express from 'express';
import http from 'http';
import {Server} from 'socket.io';

import { connectDB } from './config/mongoDB.js';
import notificationRoutes from './routes/notificationRoutes.js';
import socketModule from './sockets/socket.js'
const {setUpSocket, onlineUsers} = socketModule;

connectDB();

const app= express();
const server= http.createServer(app);
const io= new Server(server);

app.use("/api/notification", notificationRoutes);
setUpSocket(io);

server.listen(process.env.PORT, ()=>{
    console.log("Server is Listening on Port", process.env.PORT);
});