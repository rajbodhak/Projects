import express from "express";
import { sendMessage, getMessages, sendMessageRequest, getMessageRequests, acceptMessageRequest, declineMessageRequest } from "../controllers/message.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/send/:receiverId", isAuthenticated, sendMessage);
router.get("/get/:receiverId", isAuthenticated, getMessages);
router.post("/request/send/:receiverId", isAuthenticated, sendMessageRequest);
router.get("/request/all", isAuthenticated, getMessageRequests);
router.put("/request/accept/:requestId", isAuthenticated, acceptMessageRequest);
router.put("/request/decline/:requestId", isAuthenticated, declineMessageRequest);

export default router;
