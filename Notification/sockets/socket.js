import {Server} from 'socket.io';

const onlineUsers= new Map();

const setUpSocket= (io)=>{
    io.on("connection", (socket)=>{
        console.log('User Connected', socket.id);

        socket.on("registerUser", (userId)=>{
            onlineUsers.set(userId, socket.id);
            console.log(`User ${userId} registered With Socket ID ${socket.id}`);
        });

        socket.on("disconnect", ()=>{
            for(const [userId, socketId] of onlineUsers.entries()){
                if(socketId == socket.id){
                    onlineUsers.delete(userId);
                    console.log(`User ${userId} disconnect`);
                    break;
                }
            }
        })
    })
}

export default {setUpSocket, onlineUsers};