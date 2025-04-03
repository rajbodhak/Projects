import { useState, useEffect } from 'react';
import axios from 'axios';
import { Post } from '@/lib/types';
import PostCard from '@/components/PostCard';
import { API_BASE_URL } from '@/lib/apiConfig';

const Bookmarks = () => {
    const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/posts/bookmarks`, { withCredentials: true });
                if (response.data.success) {
                    console.log("Bookmarks", response.data.posts);
                    setBookmarkedPosts(response.data.posts);
                }
            } catch (error) {
                console.log("BookmarkedPost Fetching Error in Client: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePostUpdate = (postId: string, updatedPost: Post) => {
        setBookmarkedPosts((prevPosts) =>
            prevPosts.map((post) => (post._id === postId ? updatedPost : post))
        );
    };

    if (isLoading) return <h1 className='text-2xl font-bold text-center'>Loading...</h1>;

    return (
        <div className='flex flex-col items-center justify-center w-[80%] gap-3 lg:ml-28'>
            <h1 className='text-2xl text-center font-bold text-gray-800 mb-4'>Your BookedMark Posts</h1>
            {bookmarkedPosts.length > 0 ? (
                bookmarkedPosts.map((post) => (
                    <PostCard
                        key={post._id}
                        post={post}
                        onPostUpdate={handlePostUpdate}
                    />
                ))
            ) : (
                <p className='text-gray-500 mt-4'>No bookmarks yet.</p>
            )}
        </div>
    );
};

export default Bookmarks;