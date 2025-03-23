import express, { Request, Response } from "express";
import { Multer } from "multer";
import User from "../models/user.model.ts";
import Conversation from "../models/conversation.model.ts";
import Message from "../models/message.model.ts";
import mongoose from "mongoose";
import { getRecieverSocketId, io } from "../socket/socket.ts";

interface AuthenticatedRequest extends Request {
    id?: string;
    file?: Express.Multer.File;
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { receiverId } = req.params;
        // console.log("receiverId:", receiverId);
        const { textMessage: message } = req.body;
        console.log("Message: ", message)

        // Validation
        if (!message) {
            return res.status(400).json({
                error: "Message content is required",
                success: false
            });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [userId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, receiverId]
            });
        }

        const newMessage = await Message.create({
            sender: userId,
            receiver: receiverId,
            message
        });

        if (newMessage && conversation) {
            conversation.messages.push(newMessage._id as mongoose.Types.ObjectId);
        }

        await Promise.all([conversation?.save(), newMessage.save()]);

        const revieverSocketId = getRecieverSocketId(receiverId);

        if (revieverSocketId) {
            io.to(revieverSocketId).emit('newMessage', newMessage);
        }

        return res.status(200).json({
            message: "Message sent successfully",
            success: true,
            newMessage
        });
    } catch (error) {
        console.log("Send message error", error);
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

        const conversation = await Conversation.findOne({
            participants: { $all: [userId, receiverId] }
        }).populate('messages');

        if (!conversation) {
            return res.status(200).json({
                success: true,
                messages: []
            });
        }

        return res.status(200).json({
            success: true,
            messages: conversation.messages
        });
    } catch (error) {
        console.log("Get message error", error);
        return res.status(500).json({
            error: "Internal server error while getting messages",
            success: false
        });
    }
}
