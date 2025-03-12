import { useState } from 'react'
import { User } from "@/lib/types";
import axios from 'axios';

interface ProfileDetailsProps {
    userinfo: User;
    onUpdate: (user: User) => void;
    onCancel: () => void;
}

const ProfileEdit = ({ userinfo, onUpdate, onCancel }: ProfileDetailsProps) => {
    const [name, setName] = useState(userinfo.name || ' ');
    const [bio, setBio] = useState(userinfo.bio || ' ');
    const [skills, setSkills] = useState(userinfo.skills.join(", ") || " ");
    const [github, setGithub] = useState(userinfo.github || " ");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.put('http://localhost:8000/api/users/profile/edit', {
                name, bio, skills: skills.split(",").map(skill => skill.trim()), github
            }, { withCredentials: true });
            if (response.data.success) {
                onUpdate(response.data.user);
            }
        } catch (error) {
            console.log("Edit Profile component error: ", error);
        }
    }
    return (
        <div className="max-w-lg mx-auto bg-gray-900 text-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
