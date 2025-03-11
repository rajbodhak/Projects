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
            }, { withCredentials: true })
        } catch (error) {

        }
    }
    return (
        <div>

        </div>
    )
}

export default ProfileEdit
