import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import socketReducer from "./socketSlice";
import chatReducer from "./chatSlice";
import rtnReducer from "./rtnSlice";
import themeReducer from "./themeSlice";
import postSlice from "./postSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        socketIo: socketReducer,
        chat: chatReducer,
        realTimeNotification: rtnReducer,
        theme: themeReducer,
        posts: postSlice
    },
});

export type Rootstate = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch