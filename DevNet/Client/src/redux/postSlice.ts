import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Post } from "@/lib/types";

interface PostState {
    posts: Post[];
    loading: boolean;
    error: string | null;
};

const initialState: PostState = {
    posts: [],
    loading: false,
    error: null
};

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        setPosts: (state, action: PayloadAction<Post[]>) => {
            state.posts = action.payload
        },
        addNewPost: (state, action: PayloadAction<Post>) => {
            state.posts = [action.payload, ...state.posts]
        }
    }
});

export const { setPosts, addNewPost } = postSlice.actions;
export default postSlice.reducer;