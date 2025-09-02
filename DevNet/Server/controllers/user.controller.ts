import { Request, Response } from "express";
import { userService } from "../services/user.services.ts";

// Interface for authenticated requests
interface AuthenticatedRequest extends Request {
    id?: string;
    file?: Express.Multer.File;
}

// Cookie options helper
const getCookieOptions = () => ({
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days (matching your OAuth expiry)
    secure: process.env.NODE_ENV === 'production',
});

// Validate token endpoint
export const validateToken = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        if (!req.id) {
            return res.status(401).json({
                valid: false,
                error: "Invalid token",
                success: false
            });
        }

        const user = await userService.validateUserToken(req.id);

        return res.status(200).json({
            valid: true,
            user,
            success: true
        });

    } catch (error) {
        console.error("Token validation error:", error);
        return res.status(500).json({
            valid: false,
            error: error instanceof Error ? error.message : "Token validation failed",
            success: false
        });
    }
};

// Register user
export const register = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { username, email, password, name } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(401).json({
                error: "All fields should be provided",
                success: false
            });
        }

        // Call service
        const result = await userService.registerUser({ username, email, password, name });

        console.log("Token generated successfully:", !!result.token);
        console.log("Registration request received from:", req.headers.origin);

        // Set cookie and return response WITHOUT token in body
        return res
            .cookie("token", result.token, getCookieOptions())
            .status(201)
            .json({
                message: result.message,
                user: result.user,
                success: true
                // NO token in response body - security improvement
            });

    } catch (error) {
        console.log("User creation Error", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "User not created",
            success: false
        });
    }
};

// Login user
export const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: "Please provide all fields",
                success: false,
            });
        }

        // Call service
        const result = await userService.loginUser({ email, password });

        console.log("Token generated successfully:", !!result.token);
        console.log("Login request received from:", req.headers.origin);

        // Set cookie and return response WITHOUT token in body
        return res
            .cookie("token", result.token, getCookieOptions())
            .json({
                message: result.message,
                user: result.user,
                success: true
                // NO token in response body - security improvement
            });

    } catch (error) {
        console.error("User login Error:", error);
        return res.status(401).json({
            error: error instanceof Error ? error.message : "Authentication failed",
            success: false
        });
    }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<Response> => {
    try {
        return res
            .cookie('token', '', {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === 'production',
                maxAge: 0
            })
            .json({
                message: "User logged out successfully",
                success: true
            });
    } catch (error) {
        console.log("Error", error);
        return res.status(500).json({
            error: "Logout error",
            success: false
        });
    }
};

// Get user by ID
export const getUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);

        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log("getUser error", error);
        return res.status(404).json({
            error: error instanceof Error ? error.message : "getUser error",
            success: false
        });
    }
};

// Search users
export const searchUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { query, limit } = req.query;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                error: "Search query is required",
                success: false
            });
        }

        const limitNum = limit ? parseInt(limit as string) : 10;
        const users = await userService.searchUsers(query, limitNum);

        return res.status(200).json({
            users,
            success: true
        });
    } catch (error) {
        console.error("User search error:", error);
        return res.status(500).json({
            error: "An error occurred while searching for users",
            success: false
        });
    }
};

// Get user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.params.id;
        const user = await userService.getUserProfile(userId);

        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            error: error instanceof Error ? error.message : "Profile not found",
            success: false
        });
    }
};

// Edit user profile
export const editUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }

        const { bio, github, skills, name } = req.body;
        const profilePicture = req.file;

        const user = await userService.updateUser(
            userId,
            { bio, github, skills, name },
            profilePicture
        );

        return res.status(200).json({
            message: "User updated successfully",
            success: true,
            user
        });

    } catch (error) {
        console.error("Edit User error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Edit user error",
            success: false
        });
    }
};

// Get suggested users
export const getSuggestedUsers = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        if (!req.id) {
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }

        const users = await userService.getSuggestedUsers(req.id);

        return res.status(200).json({
            users,
            success: true
        });
    } catch (error) {
        console.error("suggested user error:", error);
        return res.status(500).json({
            error: "An error occurred while fetching suggested users",
            success: false
        });
    }
};

// Get following users
export const getFollowingUsers = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        if (!req.id) {
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }

        const following = await userService.getFollowingUsers(req.id);

        return res.status(200).json({
            following,
            success: true
        });

    } catch (error) {
        console.error("Error fetching following users:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "An error occurred",
            success: false
        });
    }
};

// Follow or unfollow user
export const followOrUnfollow = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        console.log("Follow/unfollow endpoint hit");
        console.log("User ID from middleware:", req.id);

        const userId = req.id;
        const { followId } = req.params;

        if (!userId) {
            return res.status(400).json({
                error: "User not authenticated",
                success: false
            });
        }

        const result = await userService.toggleFollowUser(userId, followId);

        return res.status(200).json({
            message: result.message,
            success: true,
            isFollowing: result.isFollowing,
        });

    } catch (error) {
        console.error("Follow/unfollow error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "An error occurred while processing follow/unfollow",
            success: false
        });
    }
};

// Get follow status
export const getFollowStatus = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.id;
        const { followId } = req.params;

        if (!userId) {
            return res.status(400).json({
                error: "User not authenticated",
                success: false
            });
        }

        const result = await userService.getFollowStatus(userId, followId);

        return res.status(200).json({
            success: true,
            isFollowing: result.isFollowing
        });

    } catch (error) {
        console.error("Get follow status error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "An error occurred while checking follow status",
            success: false
        });
    }
};