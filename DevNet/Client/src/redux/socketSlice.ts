import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface SocketState {
    connected: boolean;
    socketId: string | null;
    onlineUsers: string[];
}

const initialState: SocketState = {
    connected: false,
    socketId: null,
    onlineUsers: []
};

const socketSlice = createSlice({
    name: "socket",
    initialState,
    reducers: {
        setSocketConnected: (state, action: PayloadAction<boolean>) => {
            state.connected = action.payload;
        },
        setSocketId: (state, action: PayloadAction<string | null>) => {
            state.socketId = action.payload;
        },
        setOnlineUsers: (state, action: PayloadAction<string[]>) => {
            state.onlineUsers = action.payload;
        }
    }
});

export const { setSocketConnected, setSocketId, setOnlineUsers } = socketSlice.actions;
export default socketSlice.reducer;