import PostCard from "./PostCard";
import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { Post } from "@/lib/types";
import { API_BASE_URL } from "@/lib/apiConfig";
import useRealTimePosts from "@/hooks/useRealTimePosts";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { Rootstate } from "@/redux/store";

const Posts = () => {
    const dispatch = useDispatch();
    const { posts: reduxPosts } = useSelector((state: Rootstate) => state.posts);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [skip, setSkip] = useState<number>(0);
    const limit = 10;

    // For real time post update
    useRealTimePosts();

    // Create an observer ref to track the last post element
    const observer = useRef<IntersectionObserver | null>(null);
    // Ref for the last post element
    const lastPostElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;

        // Disconnect previous observer if it exists
        if (observer.current) observer.current.disconnect();

        // Create new observer
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                // When last element is visible, load more posts
                loadMorePosts();
            }
        });

        // Observe the last post element
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Initial fetch
    useEffect(() => {
        fetchPosts();
    }, []);

    // Function to fetch initial posts
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/posts/?skip=0&limit=${limit}`, {
                withCredentials: true
            });

            if (response.data.success && Array.isArray(response.data.posts)) {
                dispatch(setPosts(response.data.posts));
                setSkip(response.data.posts.length);
                setHasMore(response.data.hasMore);
            } else {
                console.warn("API returned success but no posts or empty array");
                dispatch(setPosts([]));
                setHasMore(false);
            }
        } catch (error) {
            console.error("Fetch posts error", error);
            setError("Failed to load posts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Function to load more posts
    const loadMorePosts = async () => {
        if (!hasMore || loading) return;

        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/posts/?skip=${skip}&limit=${limit}`, {
                withCredentials: true
            });

            if (response.data.success && Array.isArray(response.data.posts) && response.data.posts.length > 0) {
                // Update Redux store with new posts appended to existing ones
                dispatch(setPosts([...reduxPosts, ...response.data.posts]));
                setSkip(prev => prev + response.data.posts.length);
                setHasMore(response.data.hasMore);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Load more posts error", error);
            setError("Failed to load more posts. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handlePostUpdate = (postId: string, updatedPost: Post) => {
        // Update the post in Redux store
        const updatedPosts = reduxPosts.map(post =>
            post._id === postId ? updatedPost : post
        );
        dispatch(setPosts(updatedPosts));
    };

    const handlePostDelete = (postId: string) => {
        // Remove the post from Redux store
        const filteredPosts = reduxPosts.filter(post => post._id !== postId);
        dispatch(setPosts(filteredPosts));
    };

    return (
        <div className="space-y-4 w-full">
            {reduxPosts.length > 0 ? (
                reduxPosts.map((post, index) => {
                    if (reduxPosts.length === index + 1) {
                        // Add ref to the last element for infinite scrolling
                        return (
                            <div key={post._id} ref={lastPostElementRef}>
                                <PostCard
                                    post={post}
                                    onPostUpdate={handlePostUpdate}
                                    onDelete={handlePostDelete}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <PostCard
                                key={post._id}
                                post={post}
                                onPostUpdate={handlePostUpdate}
                                onDelete={handlePostDelete}
                            />
                        );
                    }
                })
            ) : (
                <div className="text-center py-4">No posts found.</div>
            )}

            {loading && (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
            )}

            {!hasMore && reduxPosts.length > 0 && (
                <div className="text-center py-4 text-gray-500">No more posts to load</div>
            )}

            {error && (
                <div className="text-center py-4 text-red-500">{error}</div>
            )}
        </div>
    );
};

export default Posts;