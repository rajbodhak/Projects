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
    getProfile
} from "../controllers/user.controller.ts";
import isAuthenticated from "../middlewares/isAuthenticated.ts";
import upload from "../utils/multer.ts";
// console.log("Imported upload object:", typeof upload, upload);
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/user/:id", isAuthenticated, getuser);
router.get("/suggested-users", isAuthenticated, getSuggestedUsers);
router.get("/:id", isAuthenticated, getProfile);
router.put("/profile/edit", isAuthenticated, upload.single("profilePicture"), editUser);
router.post("/follow/:followId", isAuthenticated, followOrUnfollow);
router.get('/follow-status/:followId', isAuthenticated, getFollowStatus);
export default router