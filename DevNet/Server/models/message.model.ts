import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    text: string;
    seen: boolean;
};

const MessageSchema = new Schema<IMessage>({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    seen: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IMessage>("Message", MessageSchema);