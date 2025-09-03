import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Extend Request type to include user ID
interface AuthenticatedRequest extends Request {
    id?: string;
}

const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

        req.id = decoded.userId;

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
