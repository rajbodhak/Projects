import { useEffect } from 'react';
import ProfileEdit from '@/components/ProfileEdit';
import { useSelector } from 'react-redux';
import { Rootstate } from '@/redux/store';
import { useNavigate } from 'react-router-dom';

const Setting = () => {
    const navigate = useNavigate();
    const userinfo = useSelector((state: Rootstate) => state.auth.user);
    useEffect(() => {
        // Redirect if no user data is available
        if (!userinfo) {
            navigate('/login');
        }
    }, [userinfo, navigate]);

    const handleUpdate = () => {
        navigate(`/${userinfo?._id}`);
    };

    const handleCancel = () => {
        navigate(`/${userinfo?._id}`);
    };

    if (!userinfo) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
            {(!userinfo.name || userinfo.name.trim() === '') && (
                <p className="text-red-500 text-center mb-4 font-semibold">
                    ⚠️ Your name is required to use the site. Please update your profile below.
                </p>
            )}
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">Account Settings</h1>
            <ProfileEdit
                userinfo={userinfo}
                onUpdate={handleUpdate}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default Setting;