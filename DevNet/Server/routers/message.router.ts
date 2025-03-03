import express from "express";
import { sendMessage, getMessage } from "../controllers/message.controller.ts";
import isAuthenticated from "../middlewares/isAuthenticated.ts";

const router = express.Router();

router.post("/send/:id", isAuthenticated, sendMessage);
router.get("/get/:id", isAuthenticated, getMessage);

export default router;
