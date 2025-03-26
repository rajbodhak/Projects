import express from "express";
import {
    register,
    login,
    logout,
    getuser,
    getSuggestedUsers,
    editUser,
    followOrUnfollow,
    getFollowStatus,
    getProfile,
    getFollowingUsers,
    validateToken
} from "../controllers/user.controller.ts";
import isAuthenticated from "../middlewares/isAuthenticated.ts";
import upload from "../utils/multer.ts";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/user/:id", isAuthenticated, getuser);
router.get("/suggested-users", isAuthenticated, getSuggestedUsers);
router.get("/:id/profile", isAuthenticated, getProfile);
router.put("/profile/edit", isAuthenticated, upload.single("profilePicture"), editUser);
router.post("/follow/:followId", isAuthenticated, followOrUnfollow);
router.get("/following", isAuthenticated, getFollowingUsers)
router.get('/follow-status/:followId', isAuthenticated, getFollowStatus);
router.get('/validate-token', isAuthenticated, validateToken);

export default router;