import sharp from "sharp";
import cloudinary from "../utils/cloudinary.ts";
import Post from "../models/post.model.ts";
import User from "../models/user.model.ts";
import Comment from "../models/comment.model.ts";
import mongoose from "mongoose";
import { getRecieverSocketId, io } from "../socket/socket.ts";

// Types
interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

interface PostData {
    content: string;
}

interface CommentData {
    text: string;
}

interface PostQuery {
    skip?: number;
    limit?: number;
}

// Service class containing all post business logic
export class PostService {

    // Optimize and upload image
    private async processImage(image: UploadedFile): Promise<string> {
        // Optimize Image using Sharp
        const optimizeImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: "inside" })
            .toFormat("webp", { quality: 80 })
            .toBuffer();

        // Convert to base64
        const fileUri = `data:image/webp;base64,${optimizeImageBuffer.toString("base64")}`;

        // Upload to Cloudinary
        const cloudResponse = await cloudinary.uploader.upload(fileUri, { resource_type: "image" });

        return cloudResponse.secure_url;
    }

    // Create new post
    async createPost(userId: string, postData: PostData, image?: UploadedFile) {
        const { content } = postData;

        if (!content) {
            throw new Error("Content is required");
        }

        let imageUrl: string | undefined;

        if (image) {
            imageUrl = await this.processImage(image);
        }

        // Create post
        const post = await Post.create({
            content,
            image: imageUrl || null,
            user: userId
        });

        // Add post to user's posts array
        const user = await User.findById(userId);
        if (user) {
            user.posts.push(new mongoose.Types.ObjectId(post.id));
            await user.save();
        }

        // Populate User Data
        await post.populate({ path: "user", select: "-password" });

        // Emit socket for real time update
        io.emit('newPost', post);

        return post;
    }

    // Get all posts with pagination
    async getAllPosts(query: PostQuery) {
        const skip = query.skip || 0;
        const limit = query.limit || 10;

        // Get posts after the skip point
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit + 1)
            .populate({ path: 'user', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'user',
                    select: 'username profilePicture',
                }
            });

        // Check if there are more posts 
        const hasMore = posts.length > limit;

        // Remove the extra post we fetched just to check if there are more
        const postsToSend = hasMore ? posts.slice(0, limit) : posts;

        return {
            posts: postsToSend,
            hasMore
        };
    }

    // Get posts by specific user
    async getPostsByUser(userId: string) {
        const posts = await Post.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate({ path: 'user', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                }
            });

        return posts;
    }

    // Like a post
    async likePost(userId: string, postId: string) {
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error("Post not available");
        }

        // Post like logic
        await post.updateOne({ $addToSet: { likes: userId } });

        // Socket.io logic for real-time update
        const user = await User.findById(userId).select('name username profilePicture');
        const postOwnerId = post.user ? post.user.toString() : null;

        if (postOwnerId && postOwnerId !== userId) {
            const postOwnerSocketId = getRecieverSocketId(postOwnerId);
            if (postOwnerSocketId) {
                const notification = {
                    type: 'like',
                    userId,
                    userDetails: user,
                    postId,
                    message: 'Your post was liked'
                };
                io.to(postOwnerSocketId).emit('notification', notification);
            }
        }

        return { message: "Post Liked Successfully" };
    }

    // Dislike a post
    async dislikePost(userId: string, postId: string) {
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error("Post not available");
        }

        // Remove like from the post
        await post.updateOne({ $pull: { likes: userId } });

        // Socket.io logic for real-time update
        const user = await User.findById(userId).select('name username profilePicture');
        const postOwnerId = post?.user ? post.user.toString() : null;

        if (postOwnerId && postOwnerId !== userId) {
            const postOwnerSocketId = getRecieverSocketId(postOwnerId);
            if (postOwnerSocketId) {
                const notification = {
                    type: 'dislike',
                    userId,
                    userDetails: user,
                    postId,
                    message: 'Your post was Disliked'
                };
                io.to(postOwnerSocketId).emit('notification', notification);
            }
        }

        return { message: "Post Disliked Successfully" };
    }

    // Add comment to a post
    async addComment(userId: string, postId: string, commentData: CommentData) {
        const { text } = commentData;

        if (!text) {
            throw new Error("Text not found");
        }

        const post = await Post.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }

        // Add comment logic
        const comment = await Comment.create({
            user: userId,
            post: postId,
            text
        });

        await comment.populate({ path: 'user', select: 'username profilePicture' });

        post.comments.push(new mongoose.Types.ObjectId(comment.id));
        await post.save();

        return {
            message: "Comment added successfully",
            comment
        };
    }

    // Get comments for a post
    async getCommentsByPost(postId: string) {
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }

        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePicture');

        if (comments.length === 0) {
            return {
                message: "Comments not found for this Post",
                comments: []
            };
        }

        return {
            message: "Comments fetched successfully",
            comments
        };
    }

    // Delete a post
    async deletePost(userId: string, postId: string) {
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }

        if (post.user.toString() !== userId) {
            throw new Error("Only user can delete");
        }

        // Delete Post
        await Post.findByIdAndDelete(postId);

        // Remove post from posts list
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        user.posts = user.posts.filter((id: mongoose.Types.ObjectId) => id.toString() !== postId);
        await user.save();

        // Delete comments of the post
        await Comment.deleteMany({ post: postId });

        return { message: "Post deleted successfully" };
    }

    // Toggle bookmark for a post
    async toggleBookmark(userId: string, postId: string) {
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const postObjectId = new mongoose.Types.ObjectId(post.id);
        const postIdStr = postObjectId.toString();

        // If already bookmarked then remove it
        if (user.bookmarks.some((id: mongoose.Types.ObjectId) => id.toString() === postIdStr)) {
            user.bookmarks = user.bookmarks.filter((id: mongoose.Types.ObjectId) => id.toString() !== postIdStr);
            await user.save();
            return { message: "Bookmark removed successfully" };
        }

        // Add the bookmark
        user.bookmarks.push(postObjectId);
        await user.save();
        return { message: "Bookmark added successfully" };
    }

    // Get bookmarked posts by user
    async getBookmarkedPosts(userId: string) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Check if there are any bookmarks
        if (user.bookmarks.length === 0) {
            return [];
        }

        // Fetch all bookmarked posts with populated fields
        const bookmarkedPosts = await Post.find({
            _id: { $in: user.bookmarks }
        }).sort({ createdAt: -1 })
            .populate({ path: 'user', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'user',
                    select: 'username profilePicture',
                }
            });

        return bookmarkedPosts;
    }
}

// Export singleton instance
export const postService = new PostService();