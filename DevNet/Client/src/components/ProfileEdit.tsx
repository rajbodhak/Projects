import { useState } from 'react'
import { User } from "@/lib/types";
import axios from 'axios';
import { Focus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/apiConfig';

interface ProfileDetailsProps {
    userinfo: User;
    onUpdate: (user: User) => void;
    onCancel: () => void;
}

const ProfileEdit = ({ userinfo, onUpdate, onCancel }: ProfileDetailsProps) => {
    const navigate = useNavigate();
    const [name, setName] = useState(userinfo.name || "");
    const [bio, setBio] = useState(userinfo.bio || "");
    const [skills, setSkills] = useState(userinfo.skills?.join(", ") || "");
    const [github, setGithub] = useState(userinfo.github || "");
    const [profilePicture, setProfilePicture] = useState(userinfo.profilePicture || "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            // Preview image
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            }
            reader.readAsDataURL(file);
        }
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        //checking a valid github Link or Not
        const githubPattern = /^https:\/\/github\.com\/[a-zA-Z0-9-]+$/;
        if (!github || !githubPattern.test(github)) {
            setError("Please enter a valid GitHub URL (e.g., https://github.com/yourusername)");
            setIsSubmitting(false);
            return
        }

        try {
            const formdata = new FormData();
            formdata.append("name", name);
            formdata.append("bio", bio);

            const skillsArray = skills.split(",").map(skill => skill.trim()).filter(skill => skill !== "");
            skillsArray.forEach(skill => {
                formdata.append("skills[]", skill);
            });

            formdata.append("github", github);

            if (selectedFile) {
                formdata.append("profilePicture", selectedFile);
            }

            const response = await axios.put(
                `${API_BASE_URL}/api/users/profile/edit`,
                formdata,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                onUpdate(response.data.user);
                // Redirect to profile page
                navigate(`/${userinfo._id}`);
            }
        } catch (error: any) {
            console.error("Edit Profile component error: ", error);
            setError(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-gradient-to-br from-gray-50 dark:from-gray-900 to-white dark:to-gray-800 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mt-4 sm:mt-8 w-full">
            <h2 className="text-xl font-bold mb-4 sm:mb-6 text-amber-600 dark:text-amber-400 text-center">
                Edit Your Profile
            </h2>

            {error && (
                <div className="bg-red-100 dark:bg-red-500 dark:bg-opacity-20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-100 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
                <div className="flex items-center justify-center mb-2 sm:mb-4">
                    <div className="relative group">
                        <img
                            src={profilePicture || "https://via.placeholder.com/128"}
                            alt="profile"
                            className="w-24 h-24 sm:w-36 sm:h-36 rounded-full border-4 border-amber-400 dark:border-amber-500 shadow-lg object-cover transition-all duration-300 group-hover:opacity-80"
                        />
                        <label className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 cursor-pointer bg-amber-400 dark:bg-amber-500 border-2 border-white dark:border-gray-800 text-white shadow-md hover:bg-amber-500 dark:hover:bg-amber-600 transition-all p-2 rounded-full">
                            <Focus size={18} />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                <div className="space-y-3 sm:space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 ml-1">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500"
                            placeholder="Your name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 ml-1">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 min-h-[80px] sm:min-h-[100px]"
                            placeholder="Tell others about yourself"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 ml-1">Skills</label>
                        <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500"
                            placeholder="JavaScript, React, Node.js, etc."
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">Separate skills with commas</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 ml-1">GitHub URL</label>
                        <input
                            type="text"
                            value={github}
                            onChange={(e) => setGithub(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500"
                            placeholder="https://github.com/yourusername"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between mt-4 sm:mt-6 gap-3 sm:gap-4">
                    <button
                        type="button"
                        className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-full sm:w-1/2"
                        onClick={() => {
                            onCancel();
                            navigate(`/${userinfo._id}`);
                        }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-amber-400 dark:bg-amber-500 text-white font-medium hover:bg-amber-500 dark:hover:bg-amber-600 transition-colors w-full sm:w-1/2 flex items-center justify-center"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="inline-block h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfileEdit;