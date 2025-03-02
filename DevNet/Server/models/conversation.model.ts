import mongoose from "mongoose";

export interface IConversation extends mongoose.Document {
    participants: mongoose.Types.ObjectId[],
    messages: mongoose.Types.ObjectId[];
};

const ConversationSchema = new mongoose.Schema<IConversation>({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]
});

export default mongoose.model<IConversation>("Conversation", ConversationSchema);