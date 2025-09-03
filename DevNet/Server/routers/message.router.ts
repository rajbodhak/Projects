import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/send/:receiverId", isAuthenticated, sendMessage);
router.get("/get/:receiverId", isAuthenticated, getMessages);

export default router;
