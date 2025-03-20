import { useState } from 'react'
import { User } from "@/lib/types";
import axios from 'axios';
import { Focus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
                "http://localhost:8000/api/users/profile/edit",
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
        <div className="max-w-lg mx-auto bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-xl p-8 mt-8">
            <h2 className="text-2xl font-bold mb-6 text-amber-400 text-center">Edit Your Profile</h2>

            {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex items-center justify-center mb-4">
                    <div className="relative group">
                        <img
                            src={profilePicture || "https://via.placeholder.com/128"}
                            alt="profile"
                            className="w-36 h-36 rounded-full border-4 border-amber-500 shadow-lg object-cover transition-all duration-300 group-hover:opacity-80"
                        />
                        <label className="absolute bottom-3 right-3 cursor-pointer bg-amber-500 p-2 rounded-full border-2 border-gray-800 text-white shadow-md hover:bg-amber-600 transition-all">
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

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Your name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px]"
                            placeholder="Tell others about yourself"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Skills</label>
                        <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="JavaScript, React, Node.js, etc."
                        />
                        <p className="text-xs text-gray-400 mt-1 ml-1">Separate skills with commas</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">GitHub URL</label>
                        <input
                            type="text"
                            value={github}
                            onChange={(e) => setGithub(e.target.value)}
                            className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="https://github.com/yourusername"
                        />
                    </div>
                </div>

                <div className="flex justify-between mt-6 gap-4">
                    <button
                        type="button"
                        className="px-6 py-3 rounded-lg bg-gray-700 text-white font-medium hover:bg-gray-600 transition-colors w-1/2"
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
                        className="px-6 py-3 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors w-1/2 flex items-center justify-center"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
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