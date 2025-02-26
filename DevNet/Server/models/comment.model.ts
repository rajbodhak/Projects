import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
    user: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    text: string;
};

const CommentSchema = new Schema<IComment>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    text: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IComment>("Comment", CommentSchema);