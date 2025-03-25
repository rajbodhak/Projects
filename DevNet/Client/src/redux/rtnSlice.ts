import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/lib/types";

interface Notification {
    type: string;
    userId: string;
    userDetails: User;
    postId: string;
    message: string;
    createdAt?: Date;
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
                    // Add timestamp if not present
                    const notificationWithTime = {
                        ...notification,
                        createdAt: notification.createdAt || new Date(),
                    };
                    state.likeNotifications.push(notificationWithTime);
                } else if (notification.type === 'dislike') {
                    // Remove notification with matching userId and postId
                    state.likeNotifications = state.likeNotifications.filter(
                        item => !(item.userId === notification.userId && item.postId === notification.postId)
                    );
                }
            });
        },
        clearNotification: (state, action: PayloadAction<Notification>) => {
            // Remove the specific notification when clicked
            state.likeNotifications = state.likeNotifications.filter(
                item => !(item.userId === action.payload.userId &&
                    item.postId === action.payload.postId)
            );
        },
        clearAllNotifications: (state) => {
            state.likeNotifications = [];
        }
    }
});

export const { setLikeNotifications, clearNotification, clearAllNotifications } = rtnSlice.actions;
export default rtnSlice.reducer;