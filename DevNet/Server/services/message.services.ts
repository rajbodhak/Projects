import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import mongoose from "mongoose";
import { getRecieverSocketId, io } from "../socket/socket.js";

interface SendMessageParams {
    userId: string;
    receiverId: string;
    message: string;
}

interface GetMessagesParams {
    userId: string;
    receiverId: string;
}

export class MessageService {
    // Send a message from one user to another
    static async sendMessage({ userId, receiverId, message }: SendMessageParams) {
        // Find or create conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, receiverId]
            });
        }

        // Create new message
        const newMessage = await Message.create({
            sender: userId,
            receiver: receiverId,
            message
        });

        // Add message to conversation
        if (newMessage && conversation) {
            conversation.messages.push(newMessage._id as mongoose.Types.ObjectId);
        }

        // Save both documents
        await Promise.all([conversation?.save(), newMessage.save()]);

        // Emit socket event to receiver if online
        const receiverSocketId = getRecieverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        return newMessage;
    }

    // Get all messages between two users
    static async getMessages({ userId, receiverId }: GetMessagesParams) {
        const conversation = await Conversation.findOne({
            participants: { $all: [userId, receiverId] }
        }).populate('messages');

        if (!conversation) {
            return [];
        }

        return conversation.messages;
    }
}