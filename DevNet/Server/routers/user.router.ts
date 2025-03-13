import express from "express";
import {
    register,
    login,
    logout,
    getuser,
    getSuggestedUsers,
    editUser,
    followOrUnfollow
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
router.put("/profile/edit", isAuthenticated, upload.single("profilePicture"), editUser);
router.post("/follow/:followId", isAuthenticated, followOrUnfollow);

export default router