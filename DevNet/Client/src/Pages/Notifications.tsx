import { useSelector, useDispatch } from 'react-redux';
import { Rootstate } from '@/redux/store';
import {
    markNotificationAsRead,
} from '@/redux/rtnSlice';
import { useNavigate } from 'react-router-dom';
import { INotification } from '@/lib/types';

const Notifications = () => {
    const { notifications } = useSelector((state: Rootstate) => state.realTimeNotification);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleNotificationClick = async (notification: INotification) => {
        try {
            // Mark notification as read on the server
            const response = await fetch(`/api/notifications/${notification._id}/read`, {
                method: 'PATCH'
            });

            if (response.ok) {
                // Dispatch local state update
                dispatch(markNotificationAsRead(notification._id.toString()));

                // Navigate based on notification type
                switch (notification.types) {
                    case 'like':
                        navigate(`/post/${notification._id}`);
                        break;
                    case 'follow':
                        navigate(`/${notification.user}`);
                        break;
                    // Add more cases as needed
                    default:
                        console.log('Unknown notification type');
                }
            }
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    return (
        <div className='w-full max-w-2xl mx-auto'>
            <div className='p-4 border-b border-gray-200'>
                <h1 className='text-xl font-bold'>
                    Notifications
                    {notifications.length > 0 && (
                        <span className='ml-2 text-sm text-gray-500'>
                            ({notifications.length})
                        </span>
                    )}
                </h1>
            </div>

            {notifications.length === 0 ? (
                <div className='p-6 text-center text-gray-500'>
                    <p>No notifications yet</p>
                </div>
            ) : (
                <div className='divide-y divide-gray-100'>
                    {notifications.map((notification) => (
                        <div
                            key={notification._id?.toString() || 'unknown'}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 
                                ${notification.isRead ? 'opacity-60' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className='flex items-start'>
                                <div className='h-10 w-10 rounded-full bg-gray-200 mr-3 overflow-hidden'>
                                    {/* You might want to fetch user profile pic */}
                                    <div className='h-full w-full flex items-center justify-center bg-blue-500 text-white'>
                                        {notification.types
                                            ? notification.types.charAt(0).toUpperCase()
                                            : 'N'}
                                    </div>
                                </div>
                                <div>
                                    <p className='text-sm'>
                                        {notification.message || 'No message available'}
                                    </p>
                                    <p className='text-xs text-gray-500 mt-1'>
                                        {notification.createdAt
                                            ? new Date(notification.createdAt).toLocaleString()
                                            : 'Unknown date'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;