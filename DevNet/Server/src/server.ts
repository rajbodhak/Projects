import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import "../config/passport.ts"
import connectDB from "../config/db.ts";
import userRoutes from "../routers/user.router.ts";
import postRoutes from "../routers/post.router.ts";
import messageRoutes from "../routers/message.router.ts";
import authRoutes from "../routers/auth.router.ts";
import { app, server } from "../socket/socket.ts"
import passport from "passport";

// Load environment variables first
dotenv.config();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
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
        sameSite: 'lax'
    }
}));

// Passport middleware - AFTER session
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
    res.send("Hello this is backend");
});

//User Routes
app.use("/api/users", userRoutes);
app.use("/api/posts/", postRoutes);
app.use("/api/message/", messageRoutes);
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
        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to start server:", err);
        process.exit(1);
    });