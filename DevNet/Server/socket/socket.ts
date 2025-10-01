import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const server = createServer(app);

// ✅ FIXED: Match your Express CORS configuration
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? [
                process.env.CLIENT_URL || 'https://devnet-client.vercel.app',
                /https:\/\/.*\.onrender\.com$/,
                /https:\/\/.*\.vercel\.app$/,
            ]
            : ["http://localhost:5173", "http://localhost:3000"],
        credentials: true,
        methods: ["GET", "POST"]
    }
});

const userSocketMap: Record<string, string> = {};

export const getRecieverSocketId = (revieverId: string) => userSocketMap[revieverId]

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const userId = Array.isArray(socket.handshake.query.id)
        ? socket.handshake.query.id[0]
        : socket.handshake.query.id;

    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`User ${userId} mapped to socket ${socket.id}`);

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    } else {
        console.log("Connection without userId:", socket.id);
    }
});

export { app, server, io };