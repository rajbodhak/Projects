import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import mongoose from "mongoose";
import { getRecieverSocketId, io } from "../socket/socket.js";
import MessageRequest from "../models/messagerequest.model.js";

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
        // Check they follow each other OR have an accepted request
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, receiverId] }
        });

        if (!conversation) throw new Error("No accepted conversation found");
        if (!conversation.isAccepted) throw new Error("Message request not accepted yet");

        const newMessage = await Message.create({ sender: userId, receiver: receiverId, message });
        conversation.messages.push(newMessage._id as mongoose.Types.ObjectId);
        await Promise.all([conversation.save(), newMessage.save()]);

        const receiverSocketId = getRecieverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
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

    // Send a message request
    static async sendMessageRequest({ senderId, receiverId }: { senderId: string; receiverId: string }) {
        // Check if request already exists
        const existing = await MessageRequest.findOne({ sender: senderId, receiver: receiverId });
        if (existing) {
            throw new Error(
                existing.status === "declined"
                    ? "Your request was declined"
                    : "Request already sent"
            );
        }

        // Check if they already have an accepted conversation
        const existingConvo = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
            isAccepted: true
        });
        if (existingConvo) throw new Error("You can already message this user");

        const request = await MessageRequest.create({ sender: senderId, receiver: receiverId });
        await request.populate("sender", "username name profilePicture");
        return request;
    }

    // Get all pending requests for a user
    static async getMessageRequests(userId: string) {
        const requests = await MessageRequest.find({
            receiver: userId,
            status: "pending"
        }).populate("sender", "username name profilePicture bio");
        return requests;
    }

    // Accept a request
    static async acceptMessageRequest({ requestId, userId }: { requestId: string; userId: string }) {
        const request = await MessageRequest.findById(requestId);
        if (!request) throw new Error("Request not found");
        if (request.receiver.toString() !== userId) throw new Error("Unauthorized");

        request.status = "accepted";
        await request.save();

        // Create the conversation now that it's accepted
        const conversation = await Conversation.create({
            participants: [request.sender, request.receiver],
            isAccepted: true
        });

        await request.populate("sender", "username name profilePicture");
        return { request, conversation };
    }

    // Decline a request
    static async declineMessageRequest({ requestId, userId }: { requestId: string; userId: string }) {
        const request = await MessageRequest.findById(requestId);
        if (!request) throw new Error("Request not found");
        if (request.receiver.toString() !== userId) throw new Error("Unauthorized");

        request.status = "declined";
        await request.save();
        return request;
    }
}