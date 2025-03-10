import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const response = await axios.get(
                    `http://localhost:8000/api/users/user/${user._id}`,
                    { withCredentials: true }
                );

                if (response.data.success) {
                    setUserData(response.data.user);
                }
            } catch (err) {

                console.log("User data fetching error:", err);
                setError("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return (
        <div>
            {/* {userData && <h2>Welcome, {userData.name}</h2>} */}
            <h1 className="text-2xl font-bold">This is Profile Page</h1>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {userData && (
                <pre>{JSON.stringify(userData, null, 2)}</pre>
            )}

        </div>
    );
};

export default Profile;