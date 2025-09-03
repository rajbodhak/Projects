import { User } from '@/lib/types'
import axios from 'axios';
import { useState, useEffect } from 'react'
import SuggestedUserCard from './SuggestedUserCard';
import { API_BASE_URL } from '@/lib/apiConfig';

const RightSideBar = () => {
    const [userData, setUserData] = useState<User[] | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/users/suggested-users/`, { withCredentials: true });
                if (response.data.success) {
                    setUserData(response.data.users);
                }
            } catch (error) {
                console.error("Suggested User Fetch Error in Client Side: ", error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="w-full h-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Who to Follow</h1>
            </div>
            <div className='px-8 mt-2 pb-6'>
                {userData ? (
                    userData.map((user) => (
                        <SuggestedUserCard key={user._id} userinfo={user} />
                    ))
                ) : (
                    <p className="p-4 text-gray-600 dark:text-white">No suggestions available</p>
                )}
            </div>
        </div>
    );
};

export default RightSideBar;