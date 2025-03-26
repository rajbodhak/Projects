import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { INotification } from "@/lib/types";

interface NotificationState {
    notifications: INotification[];
}

const initialState: NotificationState = {
    notifications: [],
}

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setLikeNotifications: (state, action: PayloadAction<INotification[]>) => {
            state.notifications = action.payload;
        },
        addNotification: (state, action: PayloadAction<INotification>) => {
            // Prevent duplicate notifications
            const exists = state.notifications.some(
                n => n.user.toString() === action.payload.user.toString() &&
                    n.message === action.payload.message
            );

            if (!exists) {
                state.notifications.unshift(action.payload);
            }
        },
        markAllNotificationsAsRead: (state) => {
            // Mark all notifications as read when navigating to notifications page
            state.notifications = state.notifications.map(notification => ({
                ...notification,
                isRead: true
            }));
        },
        markNotificationAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find(n => n._id.toString() === action.payload);
            if (notification) {
                notification.isRead = true;
            }
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                n => n._id.toString() !== action.payload
            );
        },
        clearAllNotifications: (state) => {
            state.notifications = [];
        }
    }
});

export const {
    setLikeNotifications,
    addNotification,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    removeNotification,
    clearAllNotifications
} = notificationSlice.actions;
export default notificationSlice.reducer;