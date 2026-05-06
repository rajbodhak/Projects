import { User } from '@/lib/types'
import axios from 'axios';
import { useState, useEffect } from 'react'
import SuggestedUserCard from './SuggestedUserCard';
import { API_BASE_URL } from '@/lib/apiConfig';

const RightSideBar = () => {
    const [userData, setUserData] = useState<User[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/users/suggested-users/`, { withCredentials: true });
                if (response.data.success) {
                    setUserData(response.data.users);
                }
            } catch (error) {
                console.error("Suggested User Fetch Error in Client Side: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="w-full h-full px-4 py-5">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                        Who to Follow
                    </h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Developers you might know
                    </p>
                </div>

                {/* List */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                    {isLoading ? (
                        // Skeleton loaders
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
                                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                                    <div className="h-2.5 bg-gray-100 dark:bg-gray-700/60 rounded w-16" />
                                </div>
                                <div className="h-7 w-20 bg-gray-100 dark:bg-gray-700/60 rounded-full" />
                            </div>
                        ))
                    ) : userData && userData.length > 0 ? (
                        userData.map((user) => (
                            <SuggestedUserCard key={user._id} userinfo={user} />
                        ))
                    ) : (
                        <div className="px-5 py-8 text-center">
                            <p className="text-sm text-gray-400 dark:text-gray-500">No suggestions right now</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {userData && userData.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700">
                        <button className="text-xs font-medium text-amber-500 hover:text-amber-600 transition-colors">
                            Show more →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RightSideBar;