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
    const [leetcode, setLeetcode] = useState(userinfo.leetcode || "");       // ← new
    const [twitter, setTwitter] = useState(userinfo.twitter || "");           // ← new
    const [linkedin, setLinkedin] = useState(userinfo.linkedin || "");        // ← new
    const [website, setWebsite] = useState(userinfo.website || "");           // ← new
    const [profilePicture, setProfilePicture] = useState(userinfo.profilePicture || "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProfilePicture(reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        // Validate GitHub
        const githubPattern = /^https:\/\/github\.com\/[a-zA-Z0-9-]+$/;
        if (github && !githubPattern.test(github)) {
            setError("Invalid GitHub URL (e.g. https://github.com/yourusername)");
            setIsSubmitting(false);
            return;
        }

        // Validate GitHub user exists
        if (github) {
            try {
                const username = github.split("https://github.com/")[1];
                await axios.get(`https://api.github.com/users/${username}`);
            } catch {
                setError("GitHub user does not exist.");
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const formdata = new FormData();
            formdata.append("name", name);
            formdata.append("bio", bio);
            formdata.append("github", github);
            formdata.append("leetcode", leetcode);   // ← new
            formdata.append("twitter", twitter);       // ← new
            formdata.append("linkedin", linkedin);     // ← new
            formdata.append("website", website);       // ← new

            skills.split(",")
                .map(s => s.trim())
                .filter(Boolean)
                .forEach(s => formdata.append("skills[]", s));

            if (selectedFile) formdata.append("profilePicture", selectedFile);

            const response = await axios.put(
                `${API_BASE_URL}/api/users/profile/edit`,
                formdata,
                { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
            );

            if (response.data.success) {
                onUpdate(response.data.user);
                navigate(`/${userinfo._id}`);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400";
    const labelClass = "block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 ml-1";

    return (
        <div className="max-w-lg mx-auto bg-gradient-to-br from-gray-50 dark:from-gray-900 to-white dark:to-gray-800 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-white rounded-2xl shadow-xl p-6 mt-8 w-full">
            <h2 className="text-xl font-bold mb-6 text-amber-600 dark:text-amber-400 text-center">Edit Your Profile</h2>

            {error && (
                <div className="bg-red-100 dark:bg-red-500/20 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Avatar */}
                <div className="flex justify-center mb-2">
                    <div className="relative group">
                        <img src={profilePicture || "https://via.placeholder.com/128"} alt="profile"
                            className="w-28 h-28 rounded-full border-4 border-amber-400 shadow-lg object-cover group-hover:opacity-80 transition-all" />
                        <label className="absolute bottom-2 right-2 cursor-pointer bg-amber-400 border-2 border-white dark:border-gray-800 text-white shadow-md hover:bg-amber-500 transition-all p-2 rounded-full">
                            <Focus size={18} />
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* Basic info */}
                <div>
                    <label className={labelClass}>Display Name <span className="text-red-500">*</span></label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Your name" />
                </div>
                <div>
                    <label className={labelClass}>Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} className={`${inputClass} min-h-[100px]`} placeholder="Tell others about yourself" />
                </div>
                <div>
                    <label className={labelClass}>Skills</label>
                    <input type="text" value={skills} onChange={e => setSkills(e.target.value)} className={inputClass} placeholder="JavaScript, React, Node.js" />
                    <p className="text-xs text-gray-400 mt-1 ml-1">Separate with commas</p>
                </div>

                {/* Dev profiles */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
                    <p className="text-sm font-medium text-amber-500">Dev Profiles</p>
                    <div>
                        <label className={labelClass}>GitHub URL</label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                            </span>
                            <input type="text" value={github} onChange={e => setGithub(e.target.value)} className={inputClass} placeholder="https://github.com/yourusername" />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>LeetCode Username</label>
                        <input type="text" value={leetcode} onChange={e => setLeetcode(e.target.value)} className={inputClass} placeholder="your-leetcode-username" />
                        <p className="text-xs text-gray-400 mt-1 ml-1">Just your username, not the full URL</p>
                    </div>
                </div>

                {/* Social links */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
                    <p className="text-sm font-medium text-amber-500">Social Links</p>
                    <div>
                        <label className={labelClass}>LinkedIn URL</label>
                        <input type="text" value={linkedin} onChange={e => setLinkedin(e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/yourprofile" />
                    </div>
                    <div>
                        <label className={labelClass}>X / Twitter URL</label>
                        <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} className={inputClass} placeholder="https://x.com/yourhandle" />
                    </div>
                    <div>
                        <label className={labelClass}>Website / Portfolio</label>
                        <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className={inputClass} placeholder="https://yoursite.dev" />
                    </div>
                </div>

                <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => { onCancel(); navigate(`/${userinfo._id}`); }}
                        className="flex-1 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button type="submit"
                        className="flex-1 py-3 rounded-lg bg-amber-400 dark:bg-amber-500 text-white font-medium hover:bg-amber-500 dark:hover:bg-amber-600 transition-colors flex items-center justify-center" disabled={isSubmitting}>
                        {isSubmitting ? <span className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" /> : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfileEdit;