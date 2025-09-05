import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import "../config/passport.js"
import connectDB from "../config/db.js";
import userRoutes from "../routers/user.router.js";
import postRoutes from "../routers/post.router.js";
import messageRoutes from "../routers/message.router.js";
import authRoutes from "../routers/auth.router.js";
import { app, server } from "../socket/socket.js"
import passport from "passport";

// Load environment variables first
dotenv.config();

// Middleware
app.use(express.json({ limit: '10mb' })); // Add limit for file uploads
app.use(cookieParser());
app.use(urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [
            process.env.CLIENT_URL || 'https://your-frontend-domain.com', // Provide fallback
            /https:\/\/.*\.railway\.app$/,
            /https:\/\/.*\.vercel\.app$/,
        ]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
};
app.use(cors(corsOptions));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL || process.env.MONGO_URI
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Passport middleware - AFTER session
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

app.get("/", (req, res) => {
    res.send("Hello this is DevNet backend running on Railway! 🚀");
});

//User Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes); // Removed trailing slash for consistency
app.use("/api/message", messageRoutes); // Removed trailing slash
app.use("/api/auth", authRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

const PORT = parseInt(process.env.PORT || "8000", 10);

// Connect to database first, then start server
connectDB()
    .then(() => {
        server.listen(PORT, '0.0.0.0', () => { // Railway needs 0.0.0.0
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
            console.log(`Health check available at /health`);
        });
    })
    .catch(err => {
        console.error("Failed to start server:", err);
        process.exit(1);
    });