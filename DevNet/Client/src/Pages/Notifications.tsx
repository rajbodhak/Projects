import { useSelector, useDispatch } from 'react-redux';
import { Rootstate } from '@/redux/store';
import { clearNotification } from '@/redux/rtnSlice';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const { likeNotifications } = useSelector((state: Rootstate) => state.realTimeNotification);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleNotificationClick = (notification: any) => {
        // Navigate to the post
        navigate(`/post/${notification.postId}`);
        // Clear this notification
        dispatch(clearNotification(notification));
    };

    return (
        <div className='w-full max-w-2xl mx-auto'>
            <div className='p-4 border-b border-gray-200'>
                <h1 className='text-xl font-bold'>Notifications</h1>
            </div>

            {likeNotifications.length === 0 ? (
                <div className='p-6 text-center text-gray-500'>
                    <p>No notifications yet</p>
                </div>
            ) : (
                <div className='divide-y divide-gray-100'>
                    {likeNotifications.map((notification, index) => (
                        <div
                            key={index}
                            className='p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200'
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className='flex items-start'>
                                <div className='h-10 w-10 rounded-full bg-gray-200 mr-3 overflow-hidden'>
                                    {notification.userDetails.profilePicture ? (
                                        <img
                                            src={notification.userDetails.profilePicture}
                                            alt={notification.userDetails.username}
                                            className='h-full w-full object-cover'
                                        />
                                    ) : (
                                        <div className='h-full w-full flex items-center justify-center bg-blue-500 text-white'>
                                            {notification.userDetails.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className='text-sm'>
                                        <span className='font-bold'>{notification.userDetails.username}</span>
                                        {' '}
                                        {notification.message}
                                    </p>
                                    <p className='text-xs text-gray-500 mt-1'>
                                        {new Date(notification.createdAt || Date.now()).toLocaleTimeString()} • {new Date(notification.createdAt || Date.now()).toLocaleDateString()}
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