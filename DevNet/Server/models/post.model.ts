import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
    user: mongoose.Types.ObjectId;
    content: string;
    image?: string;
    likes: mongoose.Types.ObjectId[];
    comments: mongoose.Types.ObjectId[];
};

const PostSchema = new Schema<IPost>({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    content: { type: String, required: true },
    image: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
}, { timestamps: true });

export default mongoose.model<IPost>("Post", PostSchema);