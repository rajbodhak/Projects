import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

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
    const dispatch = useDispatch();
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
                const response = await axios.post("http://localhost:8000/api/users/login", {
                    email: input.email,
                    password: input.password
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }, withCredentials: true
                });
                if (response.data.success) {
                    dispatch(setAuthUser(response.data.user));
                    // setUser(response.data.user);
                    console.log("User after setUser:", localStorage.getItem('user'));
                    navigate("/");
                    toast.success(response.data.message)
                }
                // console.log("User logged in successfully", response.data);
                setInput({ email: "", password: "" });

                // TODO:
                // 1. Store the token in localStorage/sessionStorage
                // 2. Redirect to the dashboard or home page
                // window.location.href = "/dashboard";

            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    setLoginError(error.response.data.message || "Login failed. Please check your credentials.");
                } else {
                    setLoginError("An error occurred. Please try again later.");
                }
                console.error("Login error:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="w-full min-h-screen p-4 flex justify-center items-center ">
            <div className="w-full max-w-md rounded-lg shadow-lg bg-white overflow-hidden">
                <div className="bg-amber-200 p-4">
                    <h1 className="text-2xl text-center font-bold">Login</h1>
                </div>

                <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                    {loginError && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                            {loginError}
                        </div>
                    )}

                    <div className="space-y-2">

                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={input.email}
                            onChange={changeInputHandler}
                            className="input-form w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2 relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter your password"
                            value={input.password}
                            onChange={changeInputHandler}
                            className="input-form"
                        />
                        <button
                            type="button"
                            className="btn-show-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>
                    {/* TODO: */}
                    {/* <div className="flex justify-end">
                        <a href="#" className="text-sm text-amber-600 hover:text-amber-800">
                            Forgot password?
                        </a>
                    </div> */}

                    <button
                        type="submit"
                        className="btn-primary w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                    <div className="text-center text-sm mt-4">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-amber-600 hover:text-amber-800 font-medium">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;