import dotenv from 'dotenv';
import http from 'http';
import { Socket } from 'socket.io';
import express from 'express';


const app= express();
const server= http.createServer(app);

dotenv.config();

const io= Socket(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});


io.on('connection', (Socket)=>{
    console.log("User Connected to the Socket ", Socket.id);

    Socket.on('sendMessage', (data)=>{
        console.log("Message Recieved", data);
        io.emit('recieveMessage', data);
    });

    Socket.on('disconnect', ()=>{
        console.log("User Dissconnected From the Socket", Socket.id);
    });
});

const PORT= 3001;
server.listen(PORT, ()=>{
    console.log("Server is Running on the Port", PORT);
});