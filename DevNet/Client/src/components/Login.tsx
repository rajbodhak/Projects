import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setAuthUser, logoutUser } from '@/redux/authSlice';
import { API_BASE_URL } from '@/lib/apiConfig';
import OAuthButtons from '@/components/OAuthButtons';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({
        email: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    // Prevent double auth check
    const authCheckRef = useRef(false);

    // Check for OAuth success/error in URL params
    useEffect(() => {
        const authStatus = searchParams.get('auth');
        const error = searchParams.get('error');

        if (authStatus === 'success' && !authCheckRef.current) {
            authCheckRef.current = true;
            // Clear URL params immediately to prevent re-runs
            window.history.replaceState({}, '', window.location.pathname);
            checkAuthStatus();
        } else if (error) {
            toast.error(error);
            setLoginError(error);
            // Clear error param too
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [searchParams]);

    // Complete cleanup of all authentication state
    const clearAllAuthState = () => {
        // Clear Redux state
        dispatch(logoutUser());

        // Clear all possible localStorage keys
        localStorage.removeItem('authUser');
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        console.log('All authentication state cleared');
    };

    const checkAuthStatus = async () => {
        try {
            // FIRST: Complete cleanup of existing auth state
            clearAllAuthState();

            // Small delay to ensure cleanup is complete
            await new Promise(resolve => setTimeout(resolve, 100));

            // THEN: Get the current user from backend
            const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                withCredentials: true
            });

            if (response.data.success) {
                // Set the user in Redux
                dispatch(setAuthUser(response.data.user));

                const origin = location.state?.from?.pathname || '/home';
                navigate(origin, { replace: true });
                toast.success('Login successful!');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // If auth check fails, make sure everything is cleared
            clearAllAuthState();
        }
    };

    const changeInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput({ ...input, [e.target.name]: e.target.value });
        // Clear errors when user types
        if (errors[e.target.name as keyof typeof errors]) {
            setErrors({
                ...errors,
                [e.target.name]: ""
            });
        }
        // Clear login error when user tries again
        if (loginError) {
            setLoginError("");
        }
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = { ...errors };

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.email.trim()) {
            newErrors.email = "Email is required";
            valid = false;
        } else if (!emailRegex.test(input.email)) {
            newErrors.email = "Please enter a valid email";
            valid = false;
        }

        // Password validation
        if (!input.password) {
            newErrors.password = "Password is required";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            setLoginError("");

            try {
                // Clear existing auth state before new login
                clearAllAuthState();

                const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
                    email: input.email,
                    password: input.password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });

                if (response.data.success) {
                    dispatch(setAuthUser(response.data.user));

                    // Redirect to the previous page or home
                    const origin = location.state?.from?.pathname || '/home';
                    navigate(origin, { replace: true });

                    toast.success(response.data.message);
                }
                setInput({ email: "", password: "" });

            } catch (error: any) {
                console.log("Login Error: ", error);
                const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
                setLoginError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-4 flex justify-center items-center">
            <div className="w-full max-w-md overflow-hidden bg-white rounded-xl shadow-lg">
                <div className="px-8 pt-8 pb-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">Welcome back</h1>
                    <p className="text-gray-500 mb-6">Please enter your details to sign in</p>

                    {loginError && (
                        <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                            {loginError}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={input.email}
                                    onChange={changeInputHandler}
                                    className={`w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent text-black`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={input.password}
                                    onChange={changeInputHandler}
                                    className={`w-full pl-10 pr-10 py-2.5 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent text-black`}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ?
                                        <EyeOff size={18} className="text-gray-400 hover:text-gray-600" /> :
                                        <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                                    }
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    {/* OAuth Buttons */}
                    <div className="mt-6">
                        <OAuthButtons isLoading={isLoading} />
                    </div>
                </div>

                <div className="px-8 py-4 bg-gray-50 mt-6 border-t border-gray-100">
                    <p className="text-center text-gray-600 text-sm">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-amber-600 hover:text-amber-800 font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;