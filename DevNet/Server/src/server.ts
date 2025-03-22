import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "../config/db.ts";
import userRoutes from "../routers/user.router.ts";
import postRoutes from "../routers/post.router.ts";
import messageRoutes from "../routers/message.router.ts";
import { app, server } from "../socket/socket.ts"

// Load environment variables first
dotenv.config();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
    res.send("Hello this is backend");
});

//User Routes
app.use("/api/users", userRoutes);
app.use("/api/posts/", postRoutes);
app.use("/api/message/", messageRoutes);

const PORT = parseInt(process.env.PORT || "8000", 10);

// Connect to database first, then start server
connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to start server:", err);
        process.exit(1);
    });