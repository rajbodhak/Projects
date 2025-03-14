import { useState } from 'react'
import { User } from "@/lib/types";
import axios from 'axios';
import { Focus } from 'lucide-react';

interface ProfileDetailsProps {
    userinfo: User;
    onUpdate: (user: User) => void;
    onCancel: () => void;
}

const ProfileEdit = ({ userinfo, onUpdate, onCancel }: ProfileDetailsProps) => {
    const [name, setName] = useState(userinfo.name || "");
    const [bio, setBio] = useState(userinfo.bio || "");
    const [skills, setSkills] = useState(userinfo.skills.join(", ") || "");
    const [github, setGithub] = useState(userinfo.github || "");
    const [profilePicture, setProfilePicture] = useState(userinfo.profilePicture || "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            //preveiw image
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            }
            reader.readAsDataURL(file);
        }
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formdata = new FormData();
            formdata.append("name", name);
            formdata.append("bio", bio);
            skills.split(",").map(skill => skill.trim()).forEach(skill => {
                formdata.append("skills[]", skill);
            });
            formdata.append("github", github);

            if (selectedFile) {
                formdata.append("profilePicture", selectedFile);
                console.log("Selected File: ", selectedFile);
            }

            // Log FormData to check if file is appended
            // for (let pair of formdata.entries()) {
            //     console.log(pair[0], pair[1]);
            // }

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
            }
        } catch (error) {
            console.error("Edit Profile component error: ", error);
        }
    };


    return (
        <div className="max-w-lg mx-auto bg-gray-900 text-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-6">
                    <div className="relative">
                        <img
                            src={profilePicture || "https://via.placeholder.com/128"}
                            alt="profile"
                            className="w-32 h-32 rounded-full border-4 border-gray-600 shadow-md"
                        />
                        <label className="absolute bottom-3 right-3 cursor-pointer bg-gray-800 p-2 rounded-full border-4 border-slate-600 text-white">
                            <Focus />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Name" />
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field" placeholder="Bio"></textarea>
                <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className="input-field" placeholder="Skills (comma-separated)" />
                <input type="text" value={github} onChange={(e) => setGithub(e.target.value)} className="input-field" placeholder="GitHub" />

                <div className="flex justify-between mt-4 gap-3">
                    <button type="button" className="btn-secondary !w-1/2" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn-primary !w-1/2">Save Changes</button>
                </div>
            </form>
        </div>
    );
}

export default ProfileEdit
