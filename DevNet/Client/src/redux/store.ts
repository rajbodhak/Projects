import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import socketReducer from "./socketSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        socketIo: socketReducer
    },
});

export type Rootstate = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch