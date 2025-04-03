import { useState } from 'react'
import { SearchIcon } from 'lucide-react'
import AutoCompleteInput from '@/components/AutoCompleteInput'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '@/lib/apiConfig'
interface User {
    _id: string;
    username: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    skills?: string[];
}

const Search = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const [isLoading, setisLoading] = useState(false);
    // Function to fetch user suggestions from the API
    const fetchUserSuggestions = async (query: string): Promise<User[]> => {

        if (!query || query.trim().length < 2) {
            return [];
        }
        setisLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/users/search?query=${encodeURIComponent(query)}&limit=10`);
            if (response.data.success) {
                return response.data.users;
            }
            return [];
        } catch (error) {
            console.error("Error fetching user suggestions:", error);
            return [];
        } finally {
            setisLoading(false);
        }
    };

    const handleUserSelect = (user: any) => {
        setSelectedUser(user);
        navigate(`/${user._id}`);
    };

    return (
        <div className='flex items-center justify-center flex-col max-w-md mx-auto w-full'>
            <h1 className='text-center text-xl my-4 font-black'>Explore</h1>
            <div className='relative w-full overflow-visible'>
                <div className='relative group w-full overflow-visible'>
                    <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition duration-200'></div>
                    <div className='relative bg-white dark:bg-gray-900 rounded-lg p-1 overflow-visible'>
                        <div className='flex items-center relative bg-white dark:bg-gray-800 rounded-lg overflow-visible'>
                            <SearchIcon className='absolute left-4 text-gray-400 h-5 w-5' />
                            {isLoading && (
                                <Loader2 className='absolute right-4 text-blue-500 animate-spin h-5 w-5' />
                            )}
                            <AutoCompleteInput
                                datakey='username'
                                onBlur={() => { }}
                                onSelect={handleUserSelect}
                                customStyles="pl-12 pr-12 py-3 w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium rounded-lg focus:ring-0 border-0 shadow-none z-50"
                                fetchSuggestions={fetchUserSuggestions}
                                placeholder='Search users...'
                                customLoading=''
                                onChange={() => { }}
                            />
                        </div>
                    </div>
                </div>
            </div>


            {selectedUser && (
                <div className="mt-6 p-4 border border-blue-100 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800 w-full">
                    <div className="flex items-center gap-3">
                        {selectedUser.profilePicture ? (
                            <img
                                src={selectedUser.profilePicture}
                                alt={selectedUser.name || selectedUser.username}
                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                {(selectedUser.name || selectedUser.username).charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h2 className="font-bold text-gray-800 dark:text-white">{selectedUser.name || selectedUser.username}</h2>
                            <p className="text-sm text-blue-500">@{selectedUser.username}</p>
                        </div>
                    </div>
                    {selectedUser.bio && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{selectedUser.bio}</p>
                    )}
                    {selectedUser.skills && selectedUser.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {selectedUser.skills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Search