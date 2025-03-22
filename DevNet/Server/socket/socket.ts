import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

const userSocketMap: Record<string, string> = {}; // Ensures object keys are always strings

io.on("connection", (socket) => {
    const userId = Array.isArray(socket.handshake.query.id)
        ? socket.handshake.query.id[0]  // Take the first element if it's an array
        : socket.handshake.query.id;

    if (userId) {  // Ensuring userId is defined
        userSocketMap[userId] = socket.id;
        console.log(`User Connected, User Id: ${userId}, Socket Id: ${socket.id}`);

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            delete userSocketMap[userId]; // Only delete if userId is valid
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    }
});

export { app, server, io };