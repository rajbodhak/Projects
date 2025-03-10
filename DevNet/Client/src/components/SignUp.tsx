import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react"

const SignUp = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const changeInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput({ ...input, [e.target.name]: e.target.value });
        if (errors[e.target.name as keyof typeof errors]) {
            setErrors({
                ...errors,
                [e.target.name]: ""
            });
        }
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = { ...errors };

        // Username validation
        if (!input.username.trim()) {
            newErrors.username = "Username is required";
            valid = false;
        } else if (input.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
            valid = false;
        }

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
        } else if (input.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            const response = await axios.post("http://localhost:8000/api/users/register", {
                username: input.username,
                email: input.email,
                password: input.password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }, withCredentials: true
            });
            if (response.data.success) {
                navigate("/");
                toast.success(response.data.message);
            }
            console.log("Form submitted:", input.username, input.email);

            setInput({ username: "", email: "", password: "" });
        }
    };

    return (
        <div className="w-full min-h-screen p-4 flex justify-center items-center">
            <div className="w-full max-w-md rounded-lg shadow-lg bg-white overflow-hidden">
                <div className="bg-amber-200 p-4">
                    <h1 className="text-2xl text-center font-bold">Sign Up</h1>
                </div>

                <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <input
                            id="username"
                            type="text"
                            name="username"
                            placeholder="username"
                            value={input.username}
                            onChange={changeInputHandler}
                            className="input-form"
                        />
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="email"
                            value={input.email}
                            onChange={changeInputHandler}
                            className="input-form"
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
                            placeholder="Password"
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

                    <button type="submit" className="btn-primary">
                        Create Account
                    </button>
                    <div className="text-center text-sm mt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-amber-600 hover:text-amber-800 font-medium">
                            Sign up
                        </Link>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default SignUp;