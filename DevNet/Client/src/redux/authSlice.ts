import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/lib/types";

interface AuthState {
    user: User | null;
    userProfile: User | null;
    chatUser: User | null;
};

const storedUser = localStorage.getItem("authUser");
const initialState: AuthState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    userProfile: null,
    chatUser: null
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        //actions
        setAuthUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            localStorage.setItem("authUser", JSON.stringify(action.payload));
        },
        setUserProfile: (state, action: PayloadAction<User | null>) => {
            state.userProfile = action.payload;
        },
        setChatUser: (state, action: PayloadAction<User | null>) => {
            state.chatUser = action.payload;
        },
        logoutUser: (state) => {
            state.user = null;
            localStorage.removeItem("authUser");
        }
    }
});

export const { setAuthUser, setUserProfile, setChatUser } = authSlice.actions;
export default authSlice.reducer;