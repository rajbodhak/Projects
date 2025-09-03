import express from "express";
import passport from "passport";
import {
    getCurrentUser,
    githubSuccess,
    googleSuccess,
    logout,
    oauthFailure
} from "../controllers/auth.controller.js";

const router = express.Router();

//Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));


router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/api/auth/failure" }),
    googleSuccess
);
//Github OAuth Routes
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback",
    passport.authenticate("github", {
        failureRedirect: "/api/auth/failure"
    }),
    githubSuccess
);

//OAuth failure Route
router.get("/failure", oauthFailure);

//Get current user
router.get("/me", getCurrentUser);

//Logout
router.post("/logout", logout);

export default router;