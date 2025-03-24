import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/lib/types";

interface Notification {
    type: string;
    userId: string;
    userDetails: User;
    postId: string;
    message: string;
}

interface NotificationState {
    likeNotifications: Notification[];
}

const initialState: NotificationState = {
    likeNotifications: [],
}

const rtnSlice = createSlice({
    name: 'realTimeNotification',
    initialState,
    reducers: {
        setLikeNotifications: (state, action: PayloadAction<Notification[]>) => {
            action.payload.forEach(notification => {
                if (notification.type === 'like') {
                    // Add like notification

                    state.likeNotifications.push(notification);
                } else if (notification.type === 'dislike') {
                    // Remove notification with matching userId and postId

                    state.likeNotifications = state.likeNotifications.filter(
                        item => !(item.userId === notification.userId && item.postId === notification.postId)
                    );
                }
            });
        }
    }
});

export const { setLikeNotifications } = rtnSlice.actions;
export default rtnSlice.reducer;