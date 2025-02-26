import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    types: string;
    message: string;
    isRead: boolean;
};

const NotificationSchema = new Schema<INotification>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    types: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<INotification>("Notification", NotificationSchema);