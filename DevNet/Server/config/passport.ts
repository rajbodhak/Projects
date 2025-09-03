import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2"
import { Strategy as jwtStrategy, ExtractJwt } from "passport-jwt"
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

interface GitHubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string | null;
}

//Jwt Strategy For API authentication
passport.use(new jwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET!,
}, async (payload: any, done: (error: any, user?: any) => void) => {
    try {
        const user = await User.findById(payload.userId).select("-password");
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

//Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({
            provider: 'google',
            providerId: profile.id
        });

        if (user) {
            return done(null, user);
        }

        // Check if user exists with same email but different provider
        const existingUser = await User.findOne({ email: profile.emails?.[0].value });

        if (existingUser) {
            // Link the Google account to existing user
            existingUser.provider = 'google';
            existingUser.providerId = profile.id;
            existingUser.isEmailVerified = true;

            // Update name and profile picture if not set
            if (!existingUser.name || existingUser.name === " ") {
                existingUser.name = profile.displayName || profile.emails?.[0].value.split('@')[0];
            }
            if (!existingUser.profilePicture && profile.photos?.[0]) {
                existingUser.profilePicture = profile.photos[0].value;
            }

            await existingUser.save();
            return done(null, existingUser);
        }

        // Generate unique username from email or displayName
        let baseUsername = profile.displayName?.replace(/\s+/g, '').toLowerCase() ||
            profile.emails?.[0].value.split('@')[0];
        let username = baseUsername;
        let counter = 1;

        // Ensure username is unique
        while (await User.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        // Create new user
        user = await User.create({
            username,
            email: profile.emails?.[0].value,
            name: profile.displayName || profile.emails?.[0].value.split('@')[0],
            profilePicture: profile.photos?.[0]?.value || '',
            provider: 'google',
            providerId: profile.id,
            isEmailVerified: true
        });

        return done(null, user);
    } catch (error) {
        return done(error as Error, undefined);
    }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: "/api/auth/github/callback",
    scope: ['user:email']
}, async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
    try {
        // Fetch user emails from GitHub API
        const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
                Authorization: `token ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'Your-App-Name'
            }
        });

        if (!emailResponse.ok) {
            throw new Error(`GitHub email API error: ${emailResponse.status}`);
        }

        const emails: GitHubEmail[] = await emailResponse.json() as GitHubEmail[];
        const primaryEmail = emails.find((email: GitHubEmail) => email.primary && email.verified);
        const email = primaryEmail ? primaryEmail.email : null;

        // If no email found, create a placeholder
        const userEmail = email || `github-${profile.id}@users.noreply.github.com`;

        // Check if user already exists with this GitHub ID
        let user = await User.findOne({
            provider: 'github',
            providerId: profile.id
        });

        if (user) {
            return done(null, user);
        }

        // Check if user exists with same email but different provider
        const existingUser = await User.findOne({ email: userEmail });

        if (existingUser) {
            // Link the GitHub account to existing user
            existingUser.provider = 'github';
            existingUser.providerId = profile.id;
            existingUser.isEmailVerified = !!email;

            // Update name, profile picture, and github URL if not set
            if (!existingUser.name || existingUser.name === " ") {
                existingUser.name = profile.displayName || profile.username || userEmail.split('@')[0];
            }
            if (!existingUser.profilePicture && profile.photos?.[0]) {
                existingUser.profilePicture = profile.photos[0].value;
            }
            if (!existingUser.github) {
                existingUser.github = profile.profileUrl || `https://github.com/${profile.username}`;
            }

            await existingUser.save();
            return done(null, existingUser);
        }

        // Generate unique username
        let baseUsername = profile.username || profile.displayName?.replace(/\s+/g, '').toLowerCase() ||
            userEmail.split('@')[0];
        let username = baseUsername;
        let counter = 1;

        // Ensure username is unique
        while (await User.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        // Create new user
        user = await User.create({
            username,
            email: userEmail,
            name: profile.displayName || profile.username || userEmail.split('@')[0],
            profilePicture: profile.photos?.[0]?.value || '',
            github: profile.profileUrl || `https://github.com/${profile.username}`,
            provider: 'github',
            providerId: profile.id,
            isEmailVerified: !!email
        });

        return done(null, user);
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        return done(error as Error);
    }
}));
// Serialize user for session
passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id).select('-password');
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;