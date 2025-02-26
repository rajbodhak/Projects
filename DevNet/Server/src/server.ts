import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"
import connectDB from "../config/db.ts"
dotenv.config({});
const app = express();

//middleware
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
})

const PORT = parseInt(process.env.PORT || "8000", 10);


app.listen(PORT, (err) => {
    if (err) console.log("Sever not started and an error occurred", err);
    connectDB();
    console.log(`Sever is running on http://localhost:${PORT}`);
})