import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    bookmarks: string[];
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load user from localStorage on initial render
    useEffect(() => {
        const loadUserFromStorage = () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Error loading user from localStorage:", error);
                // If there's an error parsing, clear the corrupted data
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    // Update user state and localStorage
    const updateUser = (newUser: User | null) => {
        if (newUser) {
            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            setIsAuthenticated(true);
            console.log("User authenticated and stored:", newUser);
        } else {
            logout();
        }
    };

    // Logout function to clear user data
    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        console.log("User logged out");
    };

    const contextValue: AuthContextType = {
        user,
        setUser: updateUser,
        logout,
        isAuthenticated,
        loading
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};