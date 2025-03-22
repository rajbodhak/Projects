// AuthGuard.jsx with more debugging
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Rootstate } from "@/redux/store";

console.log("AuthGuard module loaded"); // This will log when the file is imported

const AuthGuard = () => {
    console.log("AuthGuard is rendering");

    // Get the user from Redux
    const authUser = useSelector((state: Rootstate) => state.auth.user);
    console.log("AuthGuard - Current authUser:", authUser);

    // Add more explicit authentication check
    const isAuthenticated = Boolean(authUser && authUser._id);
    console.log("Is authenticated:", isAuthenticated);

    if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        return <Navigate to="/login" replace />;
    }

    console.log("User is authenticated, rendering protected content");
    return <Outlet />;
};

export default AuthGuard;