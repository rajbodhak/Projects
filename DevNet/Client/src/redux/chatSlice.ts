import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
    _id: string;
    sender: string;
    receiver: string;
    message: string;
    seen: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ChatState {
    onlineUsers: string[];
    messages: Message[];
}

const initialState: ChatState = {
    onlineUsers: [],
    messages: []
};

const onlineUsersSlice = createSlice({
    name: "onlineUsers",
    initialState,
    reducers: {
        setOnlineUsers: (state, action: PayloadAction<string[]>) => {
            state.onlineUsers = action.payload;
        },
        setMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages = action.payload;
        }
    }
});

export const { setOnlineUsers, setMessages } = onlineUsersSlice.actions;
export default onlineUsersSlice.reducer;