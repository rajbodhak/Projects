import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Rootstate } from "@/redux/store";

const AuthGuard = () => {
    const authUser = useSelector((state: Rootstate) => state.auth.user);

    console.log("AuthGuard User:", authUser); // Debugging

    return authUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthGuard;
