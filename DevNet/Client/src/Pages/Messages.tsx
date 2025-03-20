import { useEffect, useState } from 'react'
import axios from 'axios';
import { User } from '@/lib/types';
const Messages = () => {
    const [followingUsers, setFollowingUsers] = useState<User[]>([])

    useEffect(() => {
        const fetchFollowingUsers = async () => {
            try {
                const response = await axios.get("/api/users/following", { withCredentials: true });
                if (response.data.success) {
                    setFollowingUsers(response.data.following);
                }
            } catch (error) {
                console.log("Following User fetching Errors", error)
            }
        };
        fetchFollowingUsers();
    })
    return (
        <div className='flex min-h-screen w-full'>
            <section className='w-full md:w-[30%] border-r border-gray-500'>
                <h1 className='text-center text-2xl font-bold border-b border-gray-500 py-4'>Messages</h1>
                <div className='px-4'>
                    {followingUsers ? (
                        followingUsers.map((user) => (
                            <div className='px-4 py-3 rounded-lg bg-black/20 my-2 border border-black/80 cursor-pointer'>
                                <p className='font-bold text-gray-900'>{user.name}</p>
                                <p className='text-gray-800'>{user.username}</p>
                            </div>
                        ))
                    ) : (
                        <p> No following Users</p>
                    )}
                </div>
            </section>
            <section className='hidden md:block'>
                <h1 className='2xl font-bold'>Hello</h1>
            </section>
        </div>
    )
}

export default Messages
