import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import socketReducer from "./socketSlice";
import chatReducer from "./chatSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        socketIo: socketReducer,
        chat: chatReducer
    },
});

export type Rootstate = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch