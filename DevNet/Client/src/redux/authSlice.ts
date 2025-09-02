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
            if (action.payload) {
                localStorage.setItem("authUser", JSON.stringify(action.payload));
            } else {
                localStorage.removeItem("authUser");
            }
        },
        setUserProfile: (state, action: PayloadAction<User | null>) => {
            state.userProfile = action.payload;
        },
        setChatUser: (state, action: PayloadAction<User | null>) => {
            state.chatUser = action.payload;
        },
        logoutUser: (state) => {
            state.user = null;
            state.userProfile = null;
            state.chatUser = null;
            localStorage.removeItem("authUser");
        }
    }
});

// Make sure to export logoutUser
export const { setAuthUser, setUserProfile, setChatUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;