import { useState, useEffect } from "react";
import { User } from "@/lib/types";

interface ProfileDetailsProps {
    userinfo: User;
    onEdit: () => void;  // Function to switch to edit mode
}

const ProfileDetails = ({ userinfo, onEdit }: ProfileDetailsProps) => {
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [skills, setSkills] = useState<string[]>([]);

    useEffect(() => {
        setUserDetails(userinfo);
        setSkills(userinfo.skills || []);
    }, [userinfo]);

    return (
        <div className="max-w-lg mx-auto bg-gray-900 text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center">
                    <img
                        src={userDetails?.profilePicture}
                        alt={userDetails?.username}
                        className="w-24 h-24 rounded-full border-4 border-gray-600 shadow-md"
                    />
                    <div>
                        <h2 className="text-2xl font-bold">{userDetails?.name}</h2>
                        <p className="text-gray-400">@{userDetails?.username?.toLowerCase() || 'user'}</p>
                    </div>
                </div>
                {/* Edit Button */}
                <button className="btn-primary !w-28" onClick={onEdit}>Edit Profile</button>
            </div>

            <div className="mt-4 text-left">
                <p className="text-gray-300">
                    <span className="font-semibold text-white">Bio: </span>
                    {userDetails?.bio || "No bio available"}
                </p>
            </div>

            <div className="mt-4 text-left">
                <p className="text-gray-300">
                    <span className="font-semibold text-white">Github: </span>
                    {userDetails?.github || "No Github available"}
                </p>
            </div>


            <div className="mt-4 flex">
                <span className="font-semibold text-white mr-2">Skills:</span>
                <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                        skills.map((skill) => (
                            <span key={skill} className="bg-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                {skill}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400">No skills available</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;
