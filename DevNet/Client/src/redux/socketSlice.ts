import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/lib/types";

// interface initialProps {
//     state: User | null
// }
// const initialState: initialProps = {
//     state: null
// }
// const socketSlice = createSlice({
//     name: 'socket',
//     initialState,
//     reducers: {
//         setSocket = (state, action: PayloadAction<User | null>) {
//             state.state
//         }
//     }
// })