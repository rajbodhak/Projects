import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend Request type to include user ID
interface AuthenticatedRequest extends Request {
    id?: string;
}

const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // console.log("Cookies received:", req.cookies);
        const token = req.cookies.token;
        if (!token) {
            console.log("No token found in cookies");
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }
        // console.log("Token found in cookies");
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

        req.id = decoded.userId;
        // console.log("Decoded:", decoded);
        // console.log("Setting req.id:", decoded.userId);
        next();
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(500).json({
            error: "Server error",
            success: false
        });
    }
};

export default isAuthenticated;
