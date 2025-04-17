import sharp from "sharp";
import { Request, Response } from "express";
import cloudinary from "../utils/cloudinary.ts";
import Post from "../models/post.model.ts";
import User from "../models/user.model.ts";
import Comment from "../models/comment.model.ts";
import mongoose from "mongoose";
import { Multer } from "multer";
import { getRecieverSocketId, io } from "../socket/socket.ts";

interface AuthenticatedRequest extends Request {
    id?: string;
    file?: Express.Multer.File;
};

export const addNewPost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const image = req.file;
        const { content } = req.body;

        if (!content) {
            return res.status(401).json({ error: "Content is required", success: false });
        }

        let imageUrl: string | undefined;

        if (image) {
            // Optimize Image using Sharp
            const optimizeImageBuffer = await sharp(image.buffer)
                .resize({ width: 800, height: 800, fit: "inside" })
                .toFormat("webp", { quality: 80 })
                .toBuffer();

            // Convert to base64
            const fileUri = `data:image/webp;base64,${optimizeImageBuffer.toString("base64")}`;

            // Upload to Cloudinary
            const cloudResponse = await cloudinary.uploader.upload(fileUri, { resource_type: "image" });

            imageUrl = cloudResponse.secure_url;
        }

        const post = await Post.create({
            content,
            image: imageUrl || null,
            user: userId
        });

        const user = await User.findById(userId);
        if (user) {
            user.posts.push(post._id as mongoose.Types.ObjectId);
            await user.save();
        }

        // Populate User Data
        await post.populate({ path: "user", select: "-password" });

        //Emit socket for real time update
        io.emit('newPost', post)

        return res.status(201).json({
            post,
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "AddnewPost Internal Server Error",
            success: false
        });
    }
};

// export const getAllPosts = async (req: Request, res: Response) => {
//     try {
//         const posts = await Post.find().sort({ createdAt: -1 })
//             .populate({ path: 'user', select: 'username profilePicture' })
//             .populate({
//                 path: 'comments',
//                 options: { sort: { createdAt: -1 } },
//                 populate: {
//                     path: 'user',
//                     select: 'username profilePicture',
//                 }
//             });
//         return res.status(200).json({
//             posts,
//             success: true
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             error: "GetAllPosts Internal Server Error",
//             success: false
//         });
//     }
// };

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        // Get the "cursor" - which is the number of posts to skip
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;

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

        return res.status(200).json({
            posts: postsToSend,
            hasMore,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "GetAllPosts Internal Server Error",
            success: false
        });
    }
};

export const getPostsByUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.params.userId;
        const posts = await Post.find({ user: userId }).sort({ createdAt: -1 })
            .populate({ path: 'user', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                }
            });

        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "GetPostsByUser Internal Server Error",
            success: false
        });
    }
};

export const likePost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not available", success: false });
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

        return res.status(200).json({ success: true, message: "Post Liked Successfully" });

    } catch (error) {
        console.log("LikePost Internal Error", error);
        return res.status(500).json({
            error: "Like Post Internal Error",
            success: false
        });
    }
};


export const dislikePost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not available", success: false });
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

        return res.status(200).json({ success: true, message: "Post Disliked Successfully" });

    } catch (error) {
        console.log("Dislike Post Internal Error", error);
        return res.status(500).json({
            error: "Dislike Post Internal Error",
            success: false
        });
    }
};



export const addComments = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { postId } = req.params;
        const { text } = req.body;
        if (!text) return res.status(404).json({ error: "Text not found", success: false });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found", success: false });

        //Add comment logic
        const comment = await Comment.create({
            user: userId,
            post: postId,
            text
        });

        await comment.populate({ path: 'user', select: 'username profilePicture' });

        post.comments.push(comment._id as mongoose.Types.ObjectId);
        await post.save();

        return res.status(200).json({
            message: "Comment added successfully",
            comment,
            success: true
        })

    } catch (error) {
        console.log("Add Comment on Post Internal Error", error);
        return res.status(500).json({
            error: "Add Comment On Post Internal Error",
            success: false
        })
    }
};

export const getCommentsByPosts = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found", success: false });

        const comments = await Comment.find({ post: postId }).sort({ createdAt: -1 })
            .populate('user', 'username profilePicture');

        if (comments.length === 0) return res.status(200)
            .json({
                error: "Comments not found for this Post",
                success: true,

            });

        return res.status(200).json({
            message: "Comments fetched successfully",
            success: true,
            comments
        })

    } catch (error) {
        console.log("GetCommentByPosts Error", error);
        return res.status(500).json({
            error: "GetCommentByPosts Error",
            success: false
        })
    }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found", success: false });

        if (post.user.toString() !== userId) return res.status(401).json({ error: "only user can delete", success: false });

        //Delete Post
        await Post.findByIdAndDelete(postId);

        //remove post from posts list
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found", success: false });
        }
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        //Delete comments of the post
        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            message: "Post deleted successfully",
            success: true
        })

    } catch (error) {
        console.log("Delete Post Internal Error", error);
        return res.status(500).json({
            error: "Delete Post Internal Error",
            success: false
        })
    }
};

export const bookmarkPost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found", success: false });

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found", success: false });
        };

        const postObjectId = post._id as unknown as mongoose.Types.ObjectId;
        const postIdStr = postObjectId.toString();

        // If already bookmarked then remove it
        if (user.bookmarks.some(id => id.toString() === postIdStr)) {
            user.bookmarks = user.bookmarks.filter(id => id.toString() !== postIdStr);
            await user.save();
            return res.status(200).json({
                message: "bookmark removed successfully",
                success: true
            });
        };

        // Add the bookmark with proper type handling
        user.bookmarks.push(postObjectId);
        await user.save();
        return res.status(200).json({
            message: "bookmark added successfully",
            success: true
        });

    } catch (error) {
        console.log("Bookmark Internal Error", error);
        return res.status(500).json({
            error: "Post Bookmark Internal Error",
            success: false
        });
    }
};

export const getBookmarkedPostsByUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found", success: false });
        }

        // Check if there are any bookmarks
        if (user.bookmarks.length === 0) {
            return res.status(200).json({
                posts: [],
                success: true
            });
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

        return res.status(200).json({
            posts: bookmarkedPosts,
            success: true
        });
    } catch (error) {
        console.log("GetBookmarkedPosts Internal Error", error);
        return res.status(500).json({
            error: "GetBookmarkedPosts Internal Server Error",
            success: false
        });
    }
};