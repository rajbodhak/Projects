import { useState, useEffect } from "react";
import axios from "axios";
import ProfileDetails from "@/components/ProfileDetails";
import ProfileEdit from "@/components/ProfileEdit";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Rootstate } from "@/redux/store";

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const { user } = useSelector((state: Rootstate) => state.auth);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const response = await axios.get(
                    `http://localhost:8000/api/users/user/${user._id}`,
                    { withCredentials: true }
                );
                console.log(response);
                if (response.data.success) {
                    setUserData(response.data.user);
                }
            } catch (err) {
                console.log("User data fetching error:", err);
                setError("Failed to load user data | Login session expired");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Handle update from ProfileEdit
    const handleUpdate = (updatedUser: any) => {
        setUserData(updatedUser);
        setIsEditing(false);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-center">Profile Page</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

            {!loading && userData ? (
                isEditing ? (
                    <ProfileEdit userinfo={userData} onUpdate={handleUpdate} onCancel={() => setIsEditing(false)} />
                ) : (
                    <ProfileDetails userinfo={userData} onEdit={() => setIsEditing(true)} />
                )
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Profile;
