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
    const { user } = useAuth();


    useEffect(() => {
        if (post) {
            setPostData(post);
            // console.log("Setting postData from props:", post);
        }
    }, [post]);

    useEffect(() => {
        if (user && post) {
            // console.log("User: ", user)
            setLiked(post.likes.includes(user._id));
            setBookmarked(user?.bookmarks?.includes(post._id) || false);
        }
    }, [user, post]);

    const handleLike = async () => {
        try {
            const isLiking = !liked;
            const endpoint = isLiking
                ? `/api/posts/like/${post._id}`
                : `/api/posts/dislike/${post._id}`;

            const response = await axios.post(endpoint, {}, { withCredentials: true });

            if (response.data.success) {
                setLiked(isLiking);
                post.likes = isLiking
                    ? [...post.likes, user?._id as string]
                    : post.likes.filter((id) => id !== user?._id);
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleBookmark = async () => {
        if (!post._id) {
            console.log("Post ID is missing");
            return;
        }
        try {
            const response = await axios.post(`api/posts/bookmark/${post._id}`, {}, { withCredentials: true });

            if (response.data.success) {
                setBookmarked((prev) => !prev)
            }
        } catch (error) {
            console.log("Bookmark toggling error", error);
        }
    };

    const handleDelete = async () => {
        if (!post._id) {
            console.log("Post ID is missing");
            return;
        }
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (!confirmDelete) return;
        try {
            const response = await axios.delete(`api/posts/delete/${post._id}`, { withCredentials: true });

            if (response.data.success && typeof onDelete === "function") {
                onDelete(post._id);
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
        if (typeof onPostUpdate === "function") {
            onPostUpdate(post._id, {
                ...post,
                comments: [newComment, ...post.comments]
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

    const isOwnPost = user?._id === post.user._id;

    return (
        <>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 p-4 rounded-xl max-w-xl">
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
                                className="text-red-500 hover:text-red-700"
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
