import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface SocketState {
    connected: boolean;
    socketId: string | null;
}

const initialState: SocketState = {
    connected: false,
    socketId: null,

};

const socketSlice = createSlice({
    name: "socket",
    initialState,
    reducers: {
        //Action
        setSocketConnected: (state, action: PayloadAction<boolean>) => {
            state.connected = action.payload;
        },
        setSocketId: (state, action: PayloadAction<string | null>) => {
            state.socketId = action.payload;
        },
    }
});

export const { setSocketConnected, setSocketId } = socketSlice.actions;
export default socketSlice.reducer;