import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Rootstate } from '@/redux/store';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';

interface AuthGuardProps {
    children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { user } = useSelector((state: Rootstate) => state.auth);
    const location = useLocation();
    const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

    useEffect(() => {
        const validateToken = async () => {
            if (user) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/users/validate-token`, {
                        withCredentials: true
                    });
                    setIsTokenValid(response.data.valid);
                } catch (error) {
                    setIsTokenValid(false);
                }
            } else {
                setIsTokenValid(false);
            }
        };

        validateToken();
    }, [user]);

    // If token validation is not complete, you might want to show a loading state
    if (isTokenValid === null) {
        return <div>Loading...</div>;
    }

    // If no valid token, redirect to login
    if (!isTokenValid) {
        return <Navigate
            to="/login"
            state={{ from: location }}
            replace
        />;
    }

    // If user exists and token is valid, render children
    return <>{children}</>;
}

export default AuthGuard;