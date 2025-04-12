import { useState } from "react";
import { ImageIcon, XCircle } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Rootstate } from "@/redux/store";
import { API_BASE_URL } from "@/lib/apiConfig";

const CreatePost = () => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const { user } = useSelector((state: Rootstate) => state.auth);

    // Handle File Change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file)); // Generate preview URL
        }
    };

    // Remove Selected Image
    const removeImage = () => {
        setImage(null);
        setPreview(null);
    };

    // Handle Create Post
    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("content", content);
            if (image) formData.append("image", image);

            // Using relative URL instead of absolute URL
            const response = await axios.post(`${API_BASE_URL}/api/posts/add-post`, formData, { withCredentials: true });

            if (response.data.success) {
                console.log("Post created successfully");

                // Reset form
                setContent('');
                setImage(null);
                setPreview(null);
            }
        } catch (error) {
            console.log("Create Post Error in Client: ", error);
        }
    };

    return (
        <div className="border border-gray-700 dark:border-gray-500 rounded-2xl p-4 w-full max-w-xl mx-auto text-black/70 dark:text-white/80 mb-3 ">
            <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
                <div className="flex gap-3">
                    {/* Profile Picture */}
                    <img
                        src={user?.profilePicture}
                        alt="User Profile"
                        className="w-10 h-10 rounded-full border border-gray-600 dark:border-gray-500"
                    />

                    {/* Post Input */}
                    <div className="w-full">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's happening?"
                            className="w-full bg-transparent border-none outline-none resize-none text-lg placeholder-gray-400 dark:placeholder-gray-300 p-2"
                            rows={3}
                        />

                        {/* Image Preview (Appears Below Textarea) */}
                        {preview && (
                            <div className="relative mt-3">
                                <img src={preview} alt="Preview" className="w-full rounded-lg" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
                                >
                                    <XCircle className="text-red-500 w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    {/* Image Upload */}
                    <label className="cursor-pointer flex items-center gap-2 text-orange-400 hover:text-orange-500">
                        <ImageIcon className="w-6 h-6" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>

                    {/* Post Button */}
                    <button
                        className={`bg-orange-500 text-white px-4 py-2 rounded-full font-semibold transition cursor-pointer ${content.trim() ? "hover:bg-orange-600" : "opacity-50 cursor-not-allowed"
                            }`}
                        disabled={!content.trim()}
                    >
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;