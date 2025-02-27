import User from "../models/user.model.ts";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import cloudinary from "../utils/cloudinary.ts";
import getDataUri from "../utils/datauri.ts";
import { UploadApiResponse } from "cloudinary"
import mongoose from "mongoose";

export const register = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                error: "All fields should be provided",
                success: false
            });
        };
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                error: "This email already exist, try another one",
                success: false
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "user created successfully",
            success: true
        })
    } catch (error) {
        console.log("User creation Error", error);
        return res.status(500).json({
            error: "User not created",
            success: false
        })
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
                error: "Wrong email or password",
                success: false
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                error: "Wrong password",
                success: false
            });
        }

        // Extract only necessary user data
        const userData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            github: user.github,
            skills: user.skills,
            bookmarks: user.bookmarks,
        };

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });

        const cookieOptions: {
            httpOnly: boolean;
            sameSite: "strict";  // Fix: Explicitly setting it to "strict"
            maxAge: number;
            secure: boolean;
        } = {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production' // Secure only in production
        };


        return res
            .cookie("token", token, cookieOptions)
            .json({
                message: `Welcome back, ${user.username}!`,
                user: userData,
                success: true
            });

    } catch (error) {
        console.error("User login Error:", error);
        return res.status(500).json({
            error: "Login error",
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
        let user = await User.findById(userId);
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
}

export const editUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated", success: false });
        }

        const { bio, github, skills } = req.body;
        const profilePicture: Express.Multer.File | undefined = req.file;
        let cloudResponse: UploadApiResponse | undefined;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            if (!fileUri) {
                return res.status(400).json({ error: "Invalid file upload", success: false });
            }
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found", success: false });
        }

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

export const followOrUnfollow = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
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
}