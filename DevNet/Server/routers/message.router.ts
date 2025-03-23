import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.ts";
import isAuthenticated from "../middlewares/isAuthenticated.ts";

const router = express.Router();

router.post("/send/:receiverId", isAuthenticated, sendMessage);
router.get("/get/:id", isAuthenticated, getMessages);

export default router;
