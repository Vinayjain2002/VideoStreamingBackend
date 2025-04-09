import {Server} from 'socket.io';
import { createServer } from "http";
import express from 'express';

const app= express();
const server= createServer(app);

export const io= new Server(server, {cors: {origin: "*"}});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
  
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined`);
    });
  
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
  

  server.listen(3001, () => console.log("⚡ WebSocket server running on port 3001"));
