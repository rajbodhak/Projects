import mongoose, { Schema, Document } from "mongoose";

export type RequestStatus = "pending" | "accepted" | "declined";

export interface IMessageRequest extends Document {
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    status: RequestStatus;
}

const MessageRequestSchema = new Schema<IMessageRequest>({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" }
}, { timestamps: true });

// Prevent duplicate requests
MessageRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export default mongoose.model<IMessageRequest>("MessageRequest", MessageRequestSchema);