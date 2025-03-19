import React, { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import axios from "axios";
import { Comment } from "@/lib/types";
import { useSelector } from "react-redux";
import { Rootstate } from "@/redux/store";
import { useNavigate } from "react-router-dom";

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    comments: Comment[];
    onCommentAdded: (newComment: Comment) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, postId, comments, onCommentAdded }) => {
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state: Rootstate) => state.auth);
    const modalRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Handle click outside to close modal
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Prevent background scrolling
        const handleScroll = (e: Event) => {
            if (isOpen) {
                e.preventDefault();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "hidden"; // Prevent scrolling
            document.addEventListener("wheel", handleScroll, { passive: false });
            document.addEventListener("touchmove", handleScroll, { passive: false });
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = ""; // Re-enable scrolling
            document.removeEventListener("wheel", handleScroll);
            document.removeEventListener("touchmove", handleScroll);
        };
    }, [isOpen, onClose]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!commentText.trim() || !user) return;

        setLoading(true);
        try {
            const response = await axios.post(
                `/api/posts/comment/${postId}`,
                { text: commentText },
                { withCredentials: true }
            );

            if (response.data.success) {
                onCommentAdded(response.data.comment);
                setCommentText("");
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/65 h-screen bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg mx-4 shadow-lg"
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-black dark:text-white">Comments</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="max-h-96 overflow-y-auto p-4">
                    {comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                    ) : (
                        comments.map((comment, index) => (
                            <div key={comment._id || index} className="mb-4 last:mb-0">
                                <div className="flex items-start">
                                    <img
                                        src={comment.user.profilePicture || "/api/placeholder/32/32"}
                                        alt={comment.user.username}
                                        className="w-8 h-8 rounded-full flex-shrink-0 cursor-pointer"
                                        onClick={() => navigate(`/${comment.user?._id}`)}
                                    />
                                    <div className="ml-2 flex-1">
                                        <div className="flex items-center">
                                            <span
                                                className="font-semibold text-black dark:text-white cursor-pointer"
                                                onClick={() => navigate(`/${comment.user?._id}`)}>
                                                {comment.user.username}
                                            </span>
                                            <span className="ml-2 text-xs text-gray-500">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-black text-left dark:text-white text-sm mt-1">{comment.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {user && (
                    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center">
                            <img
                                src={user.profilePicture || "/api/placeholder/32/32"}
                                alt="Your profile"
                                className="w-8 h-8 rounded-full flex-shrink-0 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="ml-2 flex-1 bg-gray-100 dark:bg-gray-700 text-black dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || loading}
                                className="ml-2 p-2 rounded-full bg-amber-500 text-white disabled:opacity-50"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};