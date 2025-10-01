import { ReactNode, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Rootstate } from '@/redux/store';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';
import { logoutUser } from '@/redux/authSlice';

interface AuthGuardProps {
    children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { user } = useSelector((state: Rootstate) => state.auth);
    const location = useLocation();
    const dispatch = useDispatch();
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const validateToken = async () => {
            // If no user in state, immediately set as invalid
            if (!user) {
                if (isMounted) {
                    setIsTokenValid(false);
                    setIsValidating(false);
                }
                return;
            }

            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/users/validate-token`,
                    {
                        withCredentials: true,
                        signal: controller.signal,
                        timeout: 10000, // 10 second timeout
                    }
                );

                if (isMounted) {
                    setIsTokenValid(response.data.valid);
                    setIsValidating(false);
                }
            } catch (error: any) {
                if (isMounted) {
                    // If 401 or any auth error, logout and redirect
                    if (error.response?.status === 401 ||
                        error.code === 'ERR_NETWORK' ||
                        error.code === 'ECONNABORTED') {
                        console.log('Token validation failed, logging out');
                        dispatch(logoutUser());
                        setIsTokenValid(false);
                    } else {
                        // For other errors, still set as invalid but log it
                        console.error('Token validation error:', error.message);
                        setIsTokenValid(false);
                    }
                    setIsValidating(false);
                }
            }
        };

        validateToken();

        // Cleanup function
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [user?._id, dispatch]); // Only re-run if user ID changes

    // Show loading state while validating
    if (isValidating) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    // If no valid token, redirect to login
    if (!isTokenValid || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user is logged in but name is missing, redirect to settings
    if ((!user.name || user.name.trim() === "") && location.pathname !== "/settings") {
        return <Navigate to="/settings" state={{ from: location }} replace />;
    }

    // If user exists and token is valid, render children
    return <>{children}</>;
};

export default AuthGuard;