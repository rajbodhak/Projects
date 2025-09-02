import { useEffect } from 'react';
import { API_BASE_URL } from '@/lib/apiConfig';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { logoutUser } from '@/redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '@/redux/store';

interface LogoutProps {
    isOpen: boolean,
    onCancel: () => void
};

const Logout: React.FC<LogoutProps> = ({ isOpen, onCancel }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    //cancel/close modal if user clicks escape btn
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        }
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onCancel]);
    if (!isOpen) return null;

    const handleLogout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/users/logout`,
                {},
                { withCredentials: true }
            );

        } catch (error) {
            console.error("Client Logout Error: ", error);
        } finally {
            dispatch(logoutUser());
            onCancel();
            navigate("/login");
        }
    }

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={onCancel}
        >
            {/* Background blur */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal box */}
            <div
                className="relative bg-gray-800 text-white rounded-2xl p-6 w-80 shadow-lg z-10"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <h2 className="text-lg font-semibold mb-4">
                    Are you sure you want to logout?
                </h2>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Logout
