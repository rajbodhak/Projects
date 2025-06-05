import User from "../models/user.model.ts";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Multer } from "multer";
import cloudinary from "../utils/cloudinary.ts";
import getDataUri from "../utils/datauri.ts";
import { UploadApiResponse } from "cloudinary"
import mongoose from "mongoose";

export const validateToken = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        // If the request reaches this point, it means the token is valid 
        // (because the isAuthenticated middleware has already processed it)
        if (!req.id) {
            return res.status(401).json({
                valid: false,
                error: "Invalid token",
                success: false
            });
        }

        // Fetch user details (optional, but can be useful)
        const user = await User.findById(req.id).select("-password");

        if (!user) {
            return res.status(401).json({
                valid: false,
                error: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            valid: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                profilePicture: user.profilePicture
            },
            success: true
        });

    } catch (error) {
        console.error("Token validation error:", error);
        return res.status(500).json({
            valid: false,
            error: "Token validation failed",
            success: false
        });
    }
};

export const register = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { username, email, password, name } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                error: "All fields should be provided",
                success: false
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).json({
                error: "This email already exist, try another one",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and get the returned document
        const newUser = await User.create({
            name: name || " ",
            username,
            email,
            password: hashedPassword
        });

        // Populate posts (same as login)
        await newUser.populate({
            path: 'posts',
            match: { user: newUser._id as mongoose.Types.ObjectId }
        });

        // Extract user data (same structure as login)
        const userData = {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            name: newUser.name,
            profilePicture: newUser.profilePicture,
            bio: newUser.bio,
            github: newUser.github,
            skills: newUser.skills,
            bookmarks: newUser.bookmarks,
            posts: newUser.posts,
            followers: newUser.followers,
            following: newUser.following
        };

        // Generate token (same as login)
        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );
        console.log("Token generated successfully:", !!token);

        // Cookie options (same as login)
        const cookieOptions: {
            httpOnly: boolean;
            sameSite: "lax";
            maxAge: number;
            secure: boolean;
        } = {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
        };

        console.log("Registration request received from:", req.headers.origin);
        console.log("Setting cookie with options:", cookieOptions);

        //  Return same structure as login
        return res
            .cookie("token", token, cookieOptions)
            .status(201)
            .json({
                message: `Welcome ${newUser.username}! Account created successfully.`,
                user: userData,
                token: token,
                success: true
            });

    } catch (error) {
        console.log("User creation Error", error);
        return res.status(500).json({
            error: "User not created",
            success: false
        });
    }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Please provide all fields",
                success: false,
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                error: "Invalid credentials",
                success: false
            });
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                error: "Invalid credentials",
                success: false
            });
        }

        // Now populate posts in a separate step
        await user.populate({
            path: 'posts',
            match: { user: user._id as mongoose.Types.ObjectId }
        });

        // Extract only necessary user data
        const userData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            profilePicture: user.profilePicture,
            bio: user.bio,
            github: user.github,
            skills: user.skills,
            bookmarks: user.bookmarks,
            posts: user.posts,
            followers: user.followers,
            following: user.following
        };

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );
        console.log("Token generated successfully:", !!token);

        const cookieOptions: {
            httpOnly: boolean;
            sameSite: "lax";
            maxAge: number;
            secure: boolean;
        } = {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
        };
        console.log("Login request received from:", req.headers.origin);
        console.log("Setting cookie with options:", cookieOptions);

        return res
            .cookie("token", token, cookieOptions)
            .json({
                message: `Welcome back, ${user.username}!`,
                user: userData,
                token: token,
                success: true
            });

    } catch (error) {
        console.error("User login Error:", error);
        return res.status(500).json({
            error: "Authentication failed",
            success: false
        });
    }
};

export const logout = async (req: Request, res: Response): Promise<Response> => {
    try {
        return res
            .cookie('token', '', { httpOnly: true, sameSite: "strict", secure: true, maxAge: 0 })
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

export const getuser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(401).json({
                error: "user not found",
                success: false
            })
        };

        return res.status(201).json({
            user,
            success: true
        })
    } catch (error) {
        console.log("getUser error", error);
        return res.status(500).json({
            error: "getUser error",
            success: false
        })
    };
};

interface AuthenticatedRequest extends Request {
    id?: string;
    file?: Express.Multer.File;
};

// Add this function to your existing user.model.ts file

export const searchUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { query } = req.query;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                error: "Search query is required",
                success: false
            });
        }

        // Limit results to 10 users by default, or use the provided limit
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        // Search by name or username using regex for partial matching
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } }
            ]
        })
            .select("username name profilePicture bio skills") // Only return necessary fields
            .limit(limit);

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

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({ path: 'posts', options: { sort: { createdAt: -1 } } }).populate('bookmarks');
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const editUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated", success: false });
        }

        const { bio, github, skills, name } = req.body;
        const profilePicture: Express.Multer.File | undefined = req.file;
        let cloudResponse: UploadApiResponse | undefined;

        if (profilePicture) {
            console.log("About to process profile picture:", profilePicture);
            const fileUri = getDataUri(profilePicture);
            if (!fileUri) {
                return res.status(400).json({ error: "Invalid file upload", success: false });
            }
            // console.log("Cloudinary object:", cloudinary);
            // console.log("Cloudinary uploader:", cloudinary.uploader);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found", success: false });
        }

        if (name) user.name = name;
        if (bio) user.bio = bio;
        if (github) user.github = github;
        if (skills) user.skills = skills;
        if (cloudResponse) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: "User updated successfully",
            success: true,
            user
        });

    } catch (error) {
        console.error("Edit User error:", error);
        return res.status(500).json({
            error: "Edit user error",
            success: false
        });
    };
};

export const getSuggestedUsers = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        if (!req.id) {
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");

        return res.status(200).json({
            users: suggestedUsers,
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

export const getFollowingUsers = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        if (!req.id) {
            return res.status(401).json({ error: "User not authenticated", success: false });
        }

        const user = await User.findById(req.id).populate("following", "username name profilePicture");

        if (!user) {
            return res.status(404).json({ error: "User not found", success: false });
        }

        return res.status(200).json({
            following: user.following,
            success: true
        });

    } catch (error) {
        console.error("Error fetching following users:", error);
        return res.status(500).json({ error: "An error occurred", success: false });
    }
};


export const followOrUnfollow = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        console.log("Follow/unfollow endpoint hit");
        console.log("Auth request cookies:", req.cookies);
        console.log("User ID from middleware:", req.id);
        const userId = req.id;
        const { followId } = req.params;

        if (!userId) {
            return res.status(400).json({
                error: "User not authenticated",
                success: false
            })
        };

        if (userId === followId) {
            return res.status(400).json({
                error: "you can't follow or unfollow yourself",
                success: false
            })
        }

        // Convert `followId` and `userId` to ObjectId
        const followObjectId = new mongoose.Types.ObjectId(followId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const [currentUser, userToFollow] = await Promise.all([
            User.findById(userObjectId),
            User.findById(followObjectId)
        ]);

        // console.log("Current user ID:", userId);
        // console.log("Follow ID:", followId);
        // console.log("Current user ObjectId:", userObjectId);
        // console.log("Follow ObjectId:", followObjectId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ error: "User not found", success: false });
        };

        //check if already follwoing
        const isFollowing = currentUser.following.includes(followObjectId);

        if (isFollowing) {
            currentUser.following = currentUser.following.filter(id => !id.equals(followObjectId));
            userToFollow.followers = userToFollow.followers.filter(id => !id.equals(userObjectId));
        } else {
            currentUser.following.push(followObjectId);
            userToFollow.followers.push(userObjectId);
        };

        await Promise.all([currentUser.save(), userToFollow.save()]);

        return res.status(200).json({
            message: isFollowing ? "User unfollowed successfully" : "User followed successfully",
            success: true,
            isFollowing: !isFollowing,
        });

    } catch (error) {
        console.error("suggested user error:", error);
        return res.status(500).json({
            error: "An error occurred while fetching follow or unfollow users",
            success: false
        });
    }
};

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

        // Convert to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const followObjectId = new mongoose.Types.ObjectId(followId);

        // Get the current user
        const currentUser = await User.findById(userObjectId);

        if (!currentUser) {
            return res.status(404).json({ error: "User not found", success: false });
        }

        // Check if following
        const isFollowing = currentUser.following.some(id => id.equals(followObjectId));

        return res.status(200).json({
            success: true,
            isFollowing
        });

    } catch (error) {
        console.error("Get follow status error:", error);
        return res.status(500).json({
            error: "An error occurred while checking follow status",
            success: false
        });
    }
};