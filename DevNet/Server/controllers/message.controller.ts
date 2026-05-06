import { Request, Response } from "express";
import { MessageService } from "../services/message.services.js";

interface AuthenticatedRequest extends Request {
    id?: string;
    file?: Express.Multer.File;
}

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { receiverId } = req.params;
        const { textMessage: message } = req.body;

        // Validation
        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                success: false
            });
        }

        if (!receiverId) {
            return res.status(400).json({
                error: "Receiver ID is required",
                success: false
            });
        }

        if (!message) {
            return res.status(400).json({
                error: "Message content is required",
                success: false
            });
        }

        // Call service method
        const newMessage = await MessageService.sendMessage({
            userId,
            receiverId,
            message
        });

        return res.status(200).json({
            message: "Message sent successfully",
            success: true,
            newMessage
        });

    } catch (error) {
        console.error("Send message error:", error);
        return res.status(500).json({
            error: "Internal server error while sending message",
            success: false
        });
    }
};

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { receiverId } = req.params;

        // Validation
        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized",
                success: false
            });
        }

        if (!receiverId) {
            return res.status(400).json({
                error: "Receiver ID is required",
                success: false
            });
        }


        // Call service method
        const messages = await MessageService.getMessages({
            userId,
            receiverId
        });


        return res.status(200).json({
            success: true,
            messages
        });

    } catch (error) {
        console.error("Get messages error:", error);
        return res.status(500).json({
            error: "Internal server error while getting messages",
            success: false
        });
    }
};

export const sendMessageRequest = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const senderId = req.id;
        const { receiverId } = req.params;
        if (!senderId) return res.status(401).json({ error: "Unauthorized", success: false });

        const request = await MessageService.sendMessageRequest({ senderId, receiverId });

        // Notify receiver via socket in real time
        const { getRecieverSocketId, io } = await import("../socket/socket.js");
        const receiverSocketId = getRecieverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageRequest", request);
        }

        return res.status(201).json({ success: true, request });
    } catch (error: any) {
        return res.status(400).json({ error: error.message, success: false });
    }
};

export const getMessageRequests = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.id) return res.status(401).json({ error: "Unauthorized", success: false });
        const requests = await MessageService.getMessageRequests(req.id);
        return res.status(200).json({ success: true, requests });
    } catch (error: any) {
        return res.status(500).json({ error: error.message, success: false });
    }
};

export const acceptMessageRequest = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.id) return res.status(401).json({ error: "Unauthorized", success: false });
        const { requestId } = req.params;
        const result = await MessageService.acceptMessageRequest({ requestId, userId: req.id });

        // Notify sender that request was accepted
        const { getRecieverSocketId, io } = await import("../socket/socket.js");
        const senderSocketId = getRecieverSocketId(result.request.sender.toString());
        if (senderSocketId) {
            io.to(senderSocketId).emit("messageRequestAccepted", result.request);
        }

        return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
        return res.status(400).json({ error: error.message, success: false });
    }
};

export const declineMessageRequest = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.id) return res.status(401).json({ error: "Unauthorized", success: false });
        const { requestId } = req.params;
        const request = await MessageService.declineMessageRequest({ requestId, userId: req.id });
        return res.status(200).json({ success: true, request });
    } catch (error: any) {
        return res.status(400).json({ error: error.message, success: false });
    }
};