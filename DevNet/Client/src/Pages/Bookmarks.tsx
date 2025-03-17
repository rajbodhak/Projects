import { useState, useEffect } from 'react';
import axios from 'axios';
import { Post } from '@/lib/types';
import PostCard from '@/components/PostCard';

const Bookmarks = () => {
    const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("http://localhost:8000/api/posts/bookmark-posts/", { withCredentials: true });
                if (response.data.success) {
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
        <div className='flex flex-col items-center justify-center w-[80%] gap-3'>
            <h1 className='text-2xl text-center font-bold text-gray-800 mb-4'>Bookmarks</h1>
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
