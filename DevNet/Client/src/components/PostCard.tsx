import { Heart, MessageCircle, Bookmark, Trash2 } from "lucide-react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Post, Comment } from "@/lib/types";
import { CommentModal } from "./CommentModal";

interface PostCardProps {
    post: Post;
    onDelete?: (postId: string) => void;
    onPostUpdate?: (postId: string, updatedPost: Post) => void;
}

const PostCard = ({ post, onDelete, onPostUpdate }: PostCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [postData, setPostData] = useState<Post | null>(null);
    const { user, setUser } = useAuth();

    useEffect(() => {
        if (post) {
            setPostData(post);
        }
    }, [post]);

    useEffect(() => {
        if (user && postData) {
            // Check if post is liked
            setLiked(postData.likes.includes(user._id));

            // Check if post is bookmarked
            const isBookmarked = user.bookmarks &&
                Array.isArray(user.bookmarks) &&
                user.bookmarks.some(id => id === postData._id);

            setBookmarked(isBookmarked);
        }
    }, [user, postData]);

    const handleLike = async () => {
        try {
            if (!postData?._id || !user) return;

            const isLiking = !liked;
            const endpoint = isLiking
                ? `/api/posts/like/${postData._id}`
                : `/api/posts/dislike/${postData._id}`;

            const response = await axios.post(endpoint, {}, { withCredentials: true });

            if (response.data.success) {
                setLiked(isLiking);

                // Update the likes array in postData
                setPostData(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        likes: isLiking
                            ? [...prev.likes, user._id]
                            : prev.likes.filter((id) => id !== user._id)
                    };
                });

                // Notify parent component of update if needed
                if (onPostUpdate && postData) {
                    onPostUpdate(postData._id, {
                        ...postData,
                        likes: isLiking
                            ? [...postData.likes, user._id]
                            : postData.likes.filter((id) => id !== user._id)
                    });
                }
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleBookmark = async () => {
        if (!postData?._id || !user) {
            console.log("Post ID or user is missing");
            return;
        }

        try {
            const response = await axios.post(`/api/posts/bookmark/${postData._id}`, {}, { withCredentials: true });

            if (response.data.success) {
                const newBookmarkedState = !bookmarked;
                setBookmarked(newBookmarkedState);

                // Create a new user object with updated bookmarks
                const userBookmarks = Array.isArray(user.bookmarks) ? [...user.bookmarks] : [];

                let updatedBookmarks;
                if (newBookmarkedState) {
                    // Add bookmark if not already there
                    if (!userBookmarks.includes(postData._id)) {
                        updatedBookmarks = [...userBookmarks, postData._id];
                    } else {
                        updatedBookmarks = userBookmarks;
                    }
                } else {
                    // Remove bookmark
                    updatedBookmarks = userBookmarks.filter(id => id !== postData._id);
                }

                // Create updated user object
                const updatedUser = {
                    ...user,
                    bookmarks: updatedBookmarks
                };

                // Update the Auth Context with the new user data
                setUser(updatedUser);
            }
        } catch (error) {
            console.log("Bookmark toggling error", error);
        }
    };

    const handleDelete = async () => {
        if (!postData?._id) {
            console.log("Post ID is missing");
            return;
        }
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (!confirmDelete) return;
        try {
            const response = await axios.delete(`/api/posts/delete/${postData._id}`, { withCredentials: true });

            if (response.data.success && typeof onDelete === "function") {
                onDelete(postData._id);
            }
        } catch (error) {
            console.log("Delete toggling error", error);
        }
    };

    const handleCommentAdded = (newComment: Comment) => {
        if (!newComment || !newComment._id) {
            console.error("Invalid comment data:", newComment);
            return;
        }

        setPostData(prev => {
            if (!prev) return prev; // Prevent null errors

            return {
                ...prev,
                comments: [newComment, ...prev.comments]
            };
        });

        // Update parent component if needed
        if (typeof onPostUpdate === "function" && postData) {
            onPostUpdate(postData._id, {
                ...postData,
                comments: [newComment, ...postData.comments]
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            hour: "numeric",
            minute: 'numeric',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    };

    const isOwnPost = user?._id === postData?.user?._id;

    return (
        <>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 p-4 rounded-xl w-xl">
                <div className="flex justify-between">
                    <div className="flex items-center">
                        <img src={postData?.user?.profilePicture} alt={postData?.user?.username} className="w-11 h-11 rounded-full" />
                        <div className="ml-1.5 text-sm leading-tight">
                            <span className="text-black dark:text-white font-bold block">{postData?.user?.username}</span>
                            <span className="text-gray-500 dark:text-gray-300 font-normal block">@{postData?.user?.username?.toLowerCase() || 'user'}</span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <p className="text-gray-500 dark:text-gray-400 text-base py-1 my-0.5">{formatDate(postData?.createdAt ?? "")}</p>
                        {isOwnPost && (
                            <button
                                onClick={handleDelete}
                                className="text-red-500 hover:text-red-700 ml-2"
                                title="Delete post"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-black dark:text-white block text-xl leading-snug mt-3 text-left">{postData?.content}</p>

                {postData?.image && (
                    <img src={postData.image} alt="post" className="mt-2 rounded-xl border border-gray-100 dark:border-gray-700" />
                )}

                <div className="flex text-gray-500 dark:text-gray-400 mt-3">
                    <div className="flex items-center mr-6">
                        <button onClick={handleLike} className="flex items-center focus:outline-none">
                            <Heart className={`mr-1 ${liked ? "fill-amber-500 text-amber-500" : "text-amber-500 hover:text-amber-700"}`} />
                            <span>{postData?.likes?.length || 0}</span>
                        </button>
                    </div>
                    <div className="flex items-center mr-6">
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center focus:outline-none">
                            <MessageCircle className="mr-1 text-amber-500 hover:text-amber-700" />
                            <span>{postData?.comments?.length || 0}</span>
                        </button>
                    </div>
                    <div className="flex items-center ml-auto">
                        <button onClick={handleBookmark} className="flex items-center focus:outline-none">
                            <Bookmark className={`text-amber-500 hover:text-amber-700 ${bookmarked ? "fill-amber-500" : ""}`} />
                        </button>
                    </div>
                </div>
            </div>
            <CommentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                postId={postData?._id ?? " "}
                onCommentAdded={handleCommentAdded}
                comments={postData?.comments ?? []}
            />
        </>
    )
}

export default PostCard