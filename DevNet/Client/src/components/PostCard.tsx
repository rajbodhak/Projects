import { Heart, MessageCircle, Bookmark, Trash2 } from "lucide-react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Post, Comment } from "@/lib/types";
import { CommentModal } from "./CommentModal";
import { useSelector, useDispatch } from "react-redux";
import { Rootstate } from "@/redux/store";
import { setAuthUser } from "@/redux/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/apiConfig";
import defaultPfp from "../assets/default-pfp.webp";
import Modal from "./Modal";
import { motion } from "framer-motion";

interface PostCardProps {
    post: Post;
    onDelete?: (postId: string) => void;
    onPostUpdate?: (postId: string, updatedPost: Post) => void;
}

const PostCard = ({ post, onDelete, onPostUpdate }: PostCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDelModalOpen, setIsDelModalOpen] = useState(false);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [postData, setPostData] = useState<Post | null>(null);
    const { user } = useSelector((state: Rootstate) => state.auth);
    const dispatch = useDispatch(); // Add dispatch to update Redux store
    const navigate = useNavigate();

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
                ? `${API_BASE_URL}/api/posts/like/${postData._id}`
                : `${API_BASE_URL}/api/posts/dislike/${postData._id}`;

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

                // Update Redux state with the new user data
                dispatch(setAuthUser(updatedUser));
                toast.success(response.data.message)
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
        // const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        // if (!confirmDelete) return;
        try {
            const response = await axios.delete(`/api/posts/delete/${postData._id}`, { withCredentials: true });

            if (response.data.success && typeof onDelete === "function") {
                onDelete(postData._id);
            }
            setIsDelModalOpen(false);
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

    const handleRedirectProfile = () => {
        if (post?.user?._id) {
            navigate(`/${post.user._id}`);
        } else {
            console.log("User ID is undefined");
        }
    };


    const isOwnPost = user?._id === postData?.user?._id;

    return (
        <>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 p-3 sm:p-4 rounded-xl w-full">
                <div className="flex justify-between">
                    <div className="flex items-center">
                        <img
                            src={postData?.user?.profilePicture || defaultPfp}
                            alt={postData?.user?.username}
                            className="w-8 h-8 sm:w-10 md:w-11 sm:h-10 md:h-11 rounded-full cursor-pointer"
                            onClick={handleRedirectProfile}
                        />
                        <div className="ml-1 sm:ml-1.5 text-xs sm:text-sm leading-tight">
                            <span
                                className="text-black dark:text-white font-bold block cursor-pointer"
                                onClick={handleRedirectProfile}
                            >
                                {postData?.user?.username}
                            </span>
                            <span
                                className="text-gray-500 dark:text-gray-300 text-xs sm:text-sm font-normal block cursor-pointer"
                                onClick={handleRedirectProfile}
                            >
                                @{postData?.user?.username?.toLowerCase() || 'user'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm py-1 my-0.5">
                            {formatDate(postData?.createdAt ?? "")}
                        </p>
                        {isOwnPost && (
                            <div className="">
                                <button
                                    onClick={() => setIsDelModalOpen(true)}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                >
                                    <Trash2 size={16} className="sm:hidden cursor-pointer" />
                                    <Trash2 size={16} className="hidden sm:block cursor-pointer" />
                                </button>

                                <Modal
                                    isOpen={isDelModalOpen}
                                    onClose={() => setIsDelModalOpen(false)}
                                    title="Confirm Delete"
                                >
                                    <p>Are you sure you want to delete this item?</p>
                                    <div className="mt-4 flex justify-end gap-2">
                                        <button
                                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded cursor-pointer"
                                            onClick={() => setIsDelModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
                                            onClick={handleDelete}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </Modal>
                            </div>
                            // <button
                            //     onClick={handleDelete}
                            //     className="text-red-500 hover:text-red-700 ml-2"
                            //     title="Delete post"
                            // >
                            //     <Trash2 size={16} className="sm:hidden" />
                            //     <Trash2 size={18} className="hidden sm:block" />
                            // </button>
                        )}
                    </div>
                </div>

                <p className="text-black dark:text-white block text-sm sm:text-base md:text-lg lg:text-xl leading-snug mt-2 sm:mt-3 text-left">
                    {postData?.content}
                </p>

                {postData?.image && (
                    <img
                        src={postData.image}
                        alt="post"
                        className="mt-2 rounded-xl border border-gray-100 dark:border-gray-700"
                    />
                )}

                <div className="flex text-gray-500 dark:text-gray-400 mt-2 sm:mt-3">
                    <div className="flex items-center mr-4 sm:mr-6">
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            onClick={handleLike}
                            className="flex items-center focus:outline-none">
                            <Heart
                                className={`mr-1 sm:hidden cursor-pointer ${liked ? "fill-amber-500 text-amber-500" : "text-amber-500 hover:text-amber-700"}`}
                                size={16}

                            />
                            <Heart
                                className={` hidden sm:block mr-1 cursor-pointer ${liked ? "fill-amber-500 text-amber-500" : "text-amber-500 hover:text-amber-700"}`}
                                size={18}
                            />
                            <span className="text-xs sm:text-sm">{postData?.likes?.length || 0}</span>
                        </motion.button>
                    </div>
                    <div className="flex items-center mr-4 sm:mr-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setIsModalOpen(true)} className="flex items-center focus:outline-none">
                            <MessageCircle
                                className="sm:hidden mr-1 text-amber-500 hover:text-amber-700 cursor-pointer"
                                size={16}
                            />
                            <MessageCircle
                                className=" hidden sm:block mr-1 text-amber-500 hover:text-amber-700 cursor-pointer"
                                size={18}
                            />
                            <span className="text-xs sm:text-sm">{postData?.comments?.length || 0}</span>
                        </motion.button>
                    </div>
                    <div className="flex items-center ml-auto">
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            onClick={handleBookmark}
                            className="flex items-center focus:outline-none">
                            <Bookmark
                                className={`sm:hidden cursor-pointer text-amber-500 hover:text-amber-700 ${bookmarked ? "fill-amber-500" : ""}`}
                                size={16}
                            />
                            <Bookmark
                                className={`hidden sm:block cursor-pointer text-amber-500 hover:text-amber-700 ${bookmarked ? "fill-amber-500" : ""}`}
                                size={18}
                            />
                        </motion.button>
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