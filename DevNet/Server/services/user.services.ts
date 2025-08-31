import User from "../models/user.model.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.ts";
import getDataUri from "../utils/datauri.ts";
import { UploadApiResponse } from "cloudinary";
import mongoose from "mongoose";

// Define file upload interface
interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

// Types
interface UserRegistrationData {
    username: string;
    email: string;
    password: string;
    name?: string;
}

interface UserLoginData {
    email: string;
    password: string;
}

interface UserUpdateData {
    bio?: string;
    github?: string;
    skills?: string | string[];  // Can be string or array
    name?: string;
}

// Service class containing all business logic
export class UserService {

    // Generate JWT token
    private generateToken(userId: string): string {
        return jwt.sign(
            { userId },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );
    }

    // Format user data for response (remove sensitive info)
    private formatUserData(user: any) {
        return {
            _id: user.id,  // Using id instead of _id
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
    }

    // Validate user token and get user data
    async validateUserToken(userId: string) {
        const user = await User.findById(userId).select("-password");

        if (!user) {
            throw new Error("User not found");
        }

        return {
            _id: user.id,  // Using id instead of _id
            username: user.username,
            email: user.email,
            name: user.name,
            profilePicture: user.profilePicture
        };
    }

    // Register new user
    async registerUser(userData: UserRegistrationData) {
        const { username, email, password, name } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("This email already exists, try another one");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            name: name || " ",
            username,
            email,
            password: hashedPassword
        });

        // Populate posts
        await newUser.populate({
            path: 'posts',
            match: { user: new mongoose.Types.ObjectId(newUser.id) }  // Using id instead of _id
        });

        // Generate token
        const token = this.generateToken(newUser.id);  // Using id instead of _id.toString()

        return {
            user: this.formatUserData(newUser),
            token,
            message: `Welcome ${newUser.username}! Account created successfully.`
        };
    }

    // Login user
    async loginUser(loginData: UserLoginData) {
        const { email, password } = loginData;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Invalid credentials");
        }

        // Verify password
        if (!user.password) {
            throw new Error("This account uses OAuth. Please login with Google/GitHub.");
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            throw new Error("Invalid credentials");
        }


        // Populate posts
        await user.populate({
            path: 'posts',
            match: { user: new mongoose.Types.ObjectId(user.id) }  // Using id instead of _id
        });

        // Generate token
        const token = this.generateToken(user.id);  // Using id instead of _id.toString()

        return {
            user: this.formatUserData(user),
            token,
            message: `Welcome back, ${user.username}!`
        };
    }

    // Get user by ID
    async getUserById(userId: string) {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    // Search users
    async searchUsers(query: string, limit: number = 10) {
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } }
            ]
        })
            .select("username name profilePicture bio skills")
            .limit(limit);

        return users;
    }

    // Get user profile with posts and bookmarks
    async getUserProfile(userId: string) {
        const user = await User.findById(userId)
            .populate({ path: 'posts', options: { sort: { createdAt: -1 } } })
            .populate('bookmarks');

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    // Update user profile
    async updateUser(userId: string, updateData: UserUpdateData, profilePicture?: UploadedFile) {
        const { bio, github, skills, name } = updateData;
        let cloudResponse: UploadApiResponse | undefined;

        // Handle profile picture upload
        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            if (!fileUri) {
                throw new Error("Invalid file upload");
            }
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Update fields
        if (name) user.name = name;
        if (bio) user.bio = bio;
        if (github) user.github = github;
        if (skills) user.skills = Array.isArray(skills) ? skills : [skills];
        if (cloudResponse) user.profilePicture = cloudResponse.secure_url;

        await user.save();
        return user;
    }

    // Get suggested users (all users except current user)
    async getSuggestedUsers(currentUserId: string) {
        const suggestedUsers = await User.find({
            _id: { $ne: currentUserId }
        }).select("-password");

        return suggestedUsers;
    }

    // Get users that current user is following
    async getFollowingUsers(userId: string) {
        const user = await User.findById(userId)
            .populate("following", "username name profilePicture");

        if (!user) {
            throw new Error("User not found");
        }

        return user.following;
    }

    // Follow or unfollow a user
    async toggleFollowUser(currentUserId: string, followUserId: string) {
        if (currentUserId === followUserId) {
            throw new Error("You can't follow or unfollow yourself");
        }

        // Convert to ObjectId
        const followObjectId = new mongoose.Types.ObjectId(followUserId);
        const userObjectId = new mongoose.Types.ObjectId(currentUserId);

        // Get both users
        const [currentUser, userToFollow] = await Promise.all([
            User.findById(userObjectId),
            User.findById(followObjectId)
        ]);

        if (!userToFollow || !currentUser) {
            throw new Error("User not found");
        }

        // Check if already following
        const isFollowing = currentUser.following.includes(followObjectId);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => !id.equals(followObjectId));
            userToFollow.followers = userToFollow.followers.filter(id => !id.equals(userObjectId));
        } else {
            // Follow
            currentUser.following.push(followObjectId);
            userToFollow.followers.push(userObjectId);
        }

        // Save both users
        await Promise.all([currentUser.save(), userToFollow.save()]);

        return {
            message: isFollowing ? "User unfollowed successfully" : "User followed successfully",
            isFollowing: !isFollowing
        };
    }

    // Get follow status
    async getFollowStatus(currentUserId: string, targetUserId: string) {
        const userObjectId = new mongoose.Types.ObjectId(currentUserId);
        const followObjectId = new mongoose.Types.ObjectId(targetUserId);

        const currentUser = await User.findById(userObjectId);
        if (!currentUser) {
            throw new Error("User not found");
        }

        const isFollowing = currentUser.following.some(id => id.equals(followObjectId));
        return { isFollowing };
    }
}

// Export singleton instance
export const userService = new UserService();