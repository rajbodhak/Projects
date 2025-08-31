import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    name?: string;
    profilePicture?: string;
    bio?: string;
    github?: string;
    skills?: string[];
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    posts: mongoose.Types.ObjectId[];
    bookmarks: mongoose.Types.ObjectId[];

    //OAuth
    provider?: 'local' | 'google' | 'github';
    providerId?: string;
    isEmailVerified: boolean;
}

const UserSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: {
            type: String, required: function (this: IUser) {
                return this.provider === 'local' || !this.provider;
            }
        },
        name: { type: String, default: " " },
        profilePicture: { type: String },
        bio: { type: String },
        github: { type: String },
        skills: { type: [String] },
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
        bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
        provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
        providerId: { type: String, sparse: true },
        isEmailVerified: { type: Boolean, default: false }
    },
    { timestamps: true }
);
UserSchema.index({ provider: 1, providerId: 1 }, { unique: true, sparse: true });
export default mongoose.model<IUser>("User", UserSchema);
