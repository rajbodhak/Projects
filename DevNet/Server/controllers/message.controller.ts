import { Request, Response } from "express";
import { MessageService } from "../services/message.services.ts";

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