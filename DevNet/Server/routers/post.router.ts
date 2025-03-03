import express from "express";
import {
    addNewPost,
    addComments,
    deletePost,
    bookmarkPost,
    dislikePost,
    getAllPosts,
    getCommentsByPosts,
    getPostsByUser,
    likePost,
} from "../controllers/post.controller.ts";
import isAuthenticated from "../middlewares/isAuthenticated.ts";
import upload from "../utils/multer.ts";

const router = express.Router();

// Add a new post (requires authentication and file upload)
router.get("/", getAllPosts);
router.post("/add-post", isAuthenticated, upload.single("image"), addNewPost);
router.get("/user-posts/:userId", isAuthenticated, getPostsByUser);
router.post("/like/:postId", isAuthenticated, likePost);
router.post("/dislike/:postId", isAuthenticated, dislikePost);
router.post("/bookmark/:postId", isAuthenticated, bookmarkPost);
router.delete("/delete/:postId", isAuthenticated, deletePost);
router.post("/comment/:postId", isAuthenticated, addComments);
router.get("/comments/:postId", getCommentsByPosts);

export default router;
