import React from 'react';
import { Github } from 'lucide-react';

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

interface OAuthButtonsProps {
    isLoading?: boolean;
    className?: string;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ isLoading = false, className = "" }) => {
    const API_BASE_URL = 'http://localhost:8000';

    const handleGoogleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;
        console.log('Google OAuth URL:', `${API_BASE_URL}/api/auth/google`);
        window.location.href = `${API_BASE_URL}/api/auth/google`;
    };

    const handleGithubLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
        console.log('=== GitHub Button Clicked ===');
        console.log('Event:', e);
        console.log('Event type:', e.type);
        console.log('Target:', e.target);
        console.log('Current target:', e.currentTarget);

        e.preventDefault();
        e.stopPropagation();

        if (isLoading) {
            console.log('Blocked: isLoading is true');
            return;
        }

        console.log('=== GitHub OAuth Debug ===');
        console.log('Button clicked at:', new Date().toISOString());

        const githubUrl = `${API_BASE_URL}/api/auth/github`;
        console.log('GitHub OAuth URL:', githubUrl);

        // Let's try a completely different approach
        console.log('Creating a temporary link element...');
        const link = document.createElement('a');
        link.href = githubUrl;
        link.target = '_self';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Link click executed');
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    <GoogleIcon />
                    <span className="ml-2">Google</span>
                </button>

                <button
                    type="button"
                    onClick={handleGithubLogin}
                    disabled={isLoading}
                    className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"

                >
                    <Github size={20} />
                    <span className="ml-2">GitHub </span>
                </button>
            </div>
        </div>
    );
};

export default OAuthButtons;