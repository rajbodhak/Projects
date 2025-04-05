import { useState, useEffect } from 'react';
import axios from 'axios';
import { Post } from '@/lib/types';
import PostCard from '@/components/PostCard';
import { API_BASE_URL } from '@/lib/apiConfig';
import { Loader2 } from 'lucide-react';

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

    const handlePostDelete = (postId: string) => {
        setBookmarkedPosts((prevPosts) =>
            prevPosts.filter((post) => post._id !== postId)
        );
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-16 lg:pb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4 pt-3 sm:pt-4">
                Your Bookmarked Posts
            </h1>

            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            ) : bookmarkedPosts.length > 0 ? (
                <div className="flex flex-col gap-3 sm:gap-4">
                    {bookmarkedPosts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onPostUpdate={handlePostUpdate}
                            onDelete={handlePostDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-2">
                        You haven't bookmarked any posts yet.
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
                        When you bookmark posts, they'll appear here.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Bookmarks;