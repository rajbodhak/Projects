import PostCard from "./PostCard";
import axios from "axios";
import { useEffect, useState } from "react";
import { Post } from "@/lib/types";

const Posts = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // First, check the exact structure of your response
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/posts/', { withCredentials: true });

                // Log the specific array you're trying to set
                console.log("Posts array to set:", response.data.posts);

                // Check if there are actually posts
                if (response.data.success && Array.isArray(response.data.posts) && response.data.posts.length > 0) {
                    setPosts(response.data.posts);
                } else {
                    console.warn("API returned success but no posts or empty array");
                    setPosts([]); // Explicitly set empty array
                }
            } catch (error) {
                console.error("Fetch posts error", error);
                setError("Failed to load posts. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    useEffect(() => {
        console.log("Updated Posts State:", posts);
    }, [posts]);

    const handlePostUpdate = (postId: string, updatedPost: Post) => {
        setPosts(prev =>
            prev.map(post => (post._id === postId ? updatedPost : post))
        );
    };

    const handlePostDelete = (postId: string) => {
        setPosts(prev => prev.filter(post => post._id !== postId));
    };

    if (loading) return <div className="text-center py-4">Loading posts...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

    return (
        <div className="space-y-4">
            {posts.length > 0 ? (
                posts.map(post => {
                    console.log("Rendering post:", post._id);
                    return (
                        <PostCard
                            key={post._id}
                            post={post}
                            onPostUpdate={handlePostUpdate}
                            onDelete={handlePostDelete}
                        />
                    );
                })
            ) : (
                <div className="text-center py-4">No posts found. Posts length: {posts.length}</div>
            )}
        </div>
    );
};

export default Posts;
