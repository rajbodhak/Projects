import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/lib/types";

interface AuthState {
    user: User | null
};

const storedUser = localStorage.getItem("authUser");
const initialState: AuthState = {
    user: storedUser ? JSON.parse(storedUser) : null,
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
        logoutUser: (state) => {
            state.user = null;
            localStorage.removeItem("authUser");
        }
    }
});

export const { setAuthUser } = authSlice.actions;
export default authSlice.reducer;