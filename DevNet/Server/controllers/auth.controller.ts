import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, {
        expiresIn: '15d'
    });
};

// Consistent cookie options for both Google and GitHub
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days
};

export const googleSuccess = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            console.error('Google OAuth: No user found in request');
            return res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
        }

        const user = req.user as any;
        const token = generateToken(user._id);

        res.cookie('token', token, cookieOptions);

        // Consistent redirect to login page with success parameter
        res.redirect(`${process.env.CLIENT_URL}/login?auth=success`);
    } catch (error) {
        console.error('Google OAuth success error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
    }
};

// GitHub OAuth Success - Fixed to be consistent with Google
export const githubSuccess = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            console.error('GitHub OAuth: No user found in request');
            return res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
        }

        const user = req.user as any;
        console.log('GitHub OAuth success for user:', user.username);

        const token = generateToken(user._id);

        // Set HTTP-only cookie
        res.cookie('token', token, cookieOptions);

        // Consistent redirect to login page with success parameter (same as Google)
        res.redirect(`${process.env.CLIENT_URL}/login?auth=success`);
    } catch (error) {
        console.error('GitHub OAuth success error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
    }
};

// OAuth failure
export const oauthFailure = (req: Request, res: Response) => {
    console.error('OAuth failure occurred');
    res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
};

// Get current user (for checking auth status)
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Logout
export const logout = (req: Request, res: Response) => {
    try {
        res.clearCookie('token');
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};