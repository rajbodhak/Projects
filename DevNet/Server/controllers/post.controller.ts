import { Request, Response } from "express";
import { postService } from "../services/post.services.ts";

// Interface for authenticated requests - avoid extending Request directly
interface AuthenticatedRequest extends Omit<Request, 'file'> {
    id?: string;
    file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        buffer: Buffer;
        size: number;
    };
}

// Add new post
export const addNewPost = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }

        const image = req.file;
        const { content } = req.body;

        const post = await postService.createPost(userId, { content }, image);

        return res.status(201).json({
            post,
            success: true
        });

    } catch (error) {
        console.error("AddNewPost Error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "AddNewPost Internal Server Error",
            success: false
        });
    }
};

// Get all posts with pagination
export const getAllPosts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await postService.getAllPosts({ skip, limit });

        return res.status(200).json({
            posts: result.posts,
            hasMore: result.hasMore,
            success: true
        });

    } catch (error) {
        console.error("GetAllPosts Error:", error);
        return res.status(500).json({
            error: "GetAllPosts Internal Server Error",
            success: false
        });
    }
};

// Get posts by specific user
export const getPostsByUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.params.userId;
        const posts = await postService.getPostsByUser(userId);

        return res.status(200).json({
            posts,
            success: true
        });

    } catch (error) {
        console.error("GetPostsByUser Error:", error);
        return res.status(500).json({
            error: "GetPostsByUser Internal Server Error",
            success: false
        });
    }
};

// Like a post
export const likePost = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }

        const { postId } = req.params;
        const result = await postService.likePost(userId, postId);

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.log("LikePost Error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Like Post Internal Error",
            success: false
        });
    }
};

// Dislike a post
export const dislikePost = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }

        const { postId } = req.params;
        const result = await postService.dislikePost(userId, postId);

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.log("Dislike Post Error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Dislike Post Internal Error",
            success: false
        });
    }
};

// Add comment to a post
export const addComments = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }

        const { postId } = req.params;
        const { text } = req.body;

        const result = await postService.addComment(userId, postId, { text });

        return res.status(200).json({
            message: result.message,
            comment: result.comment,
            success: true
        });

    } catch (error) {
        console.log("Add Comment Error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Add Comment Internal Error",
            success: false
        });
    }
};

// Get comments for a post
export const getCommentsByPosts = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { postId } = req.params;
        const result = await postService.getCommentsByPost(postId);

        if (result.comments.length === 0) {
            return res.status(200).json({
                error: result.message,
                success: true,
            });
        }

        return res.status(200).json({
            message: result.message,
            success: true,
            comments: result.comments
        });

    } catch (error) {
        console.log("GetCommentByPosts Error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "GetCommentByPosts Error",
            success: false
        });
    }
};

// Delete a post
export const deletePost = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }

        const { postId } = req.params;
        const result = await postService.deletePost(userId, postId);

        return res.status(200).json({
            message: result.message,
            success: true
        });

    } catch (error) {
        console.log("Delete Post Error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Delete Post Internal Error",
            success: false
        });
    }
};

// Toggle bookmark for a post
export const bookmarkPost = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }

        const { postId } = req.params;
        const result = await postService.toggleBookmark(userId, postId);

        return res.status(200).json({
            message: result.message,
            success: true
        });

    } catch (error) {
        console.log("Bookmark Error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Post Bookmark Internal Error",
            success: false
        });
    }
};

// Get bookmarked posts by user
export const getBookmarkedPostsByUser = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({
                error: "User not authenticated",
                success: false
            });
        }

        const posts = await postService.getBookmarkedPosts(userId);

        return res.status(200).json({
            posts,
            success: true
        });

    } catch (error) {
        console.log("GetBookmarkedPosts Error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "GetBookmarkedPosts Internal Server Error",
            success: false
        });
    }
};