import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    name?: string;
    profilePicture?: string;
    bio?: string;
    github?: string;
    skills?: string[];
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    posts: mongoose.Types.ObjectId[];
    bookmarks: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        name: { type: String, default: " " },
        profilePicture: { type: String },
        bio: { type: String },
        github: { type: String },
        skills: { type: [String] },
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
        bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }]
    },
    { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
