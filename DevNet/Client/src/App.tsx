import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import MainLayout from './components/MainLayout';
import Home from './Pages/Home';
import { useLocation } from 'react-router-dom';
import {
  Bookmarks,
  Messages,
  Notifications,
  Profile,
  Search,
  Setting,
  UserProfile
} from './Pages/pages.ts';
import { useDispatch, useSelector } from 'react-redux';
import { Rootstate } from './redux/store';
import { useEffect } from 'react';
import { setAuthUser } from './redux/authSlice';
import { setSocketConnected, setSocketId } from './redux/socketSlice';
import socketService from './services/socketService';
import { setOnlineUsers } from './redux/chatSlice';
import { setLikeNotifications } from './redux/rtnSlice.ts';

const createProtectedRoute = (element: React.ReactNode) => (
  <AuthGuard>
    {element}
  </AuthGuard>
);

// Component to redirect authenticated users away from auth pages
const RedirectIfAuthenticated = ({ children }: { children: React.ReactNode }) => {
  const { user } = useSelector((state: Rootstate) => state.auth);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Check if this is an OAuth callback
  const isOAuthCallback = searchParams.get('auth') === 'success';

  // If user exists and it's NOT an OAuth callback, redirect to home
  if (user && !isOAuthCallback) {
    return <Navigate to="/home" replace />;
  }

  // Allow access for OAuth callbacks or when user is not authenticated
  return <>{children}</>;
};
const browserRouter = createBrowserRouter([
  // Public routes - redirect to home if already authenticated
  {
    path: '/signup',
    element: (
      <RedirectIfAuthenticated>
        <SignUp />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: '/login',
    element: (
      <RedirectIfAuthenticated>
        <Login />
      </RedirectIfAuthenticated>
    ),
  },
  // Protected routes wrapped inside AuthGuard
  {
    path: '/',
    element: createProtectedRoute(<MainLayout />),
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: createProtectedRoute(<Home />)
      },
      {
        path: ':id',
        element: createProtectedRoute(<UserProfile />)
      },
      {
        path: 'search',
        element: createProtectedRoute(<Search />)
      },
      {
        path: 'notifications',
        element: createProtectedRoute(<Notifications />)
      },
      {
        path: 'messages',
        element: createProtectedRoute(<Messages />)
      },
      {
        path: 'bookmarks',
        element: createProtectedRoute(<Bookmarks />)
      },
      {
        path: 'profile',
        element: createProtectedRoute(<Profile />)
      },
      {
        path: 'settings',
        element: createProtectedRoute(<Setting />)
      }
    ],
  },
]);

function App() {
  const { user } = useSelector((state: Rootstate) => state.auth);
  const dispatch = useDispatch();

  // Initialize auth from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setAuthUser(parsedUser));
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        localStorage.removeItem("authUser");
      }
    }
  }, [dispatch]);

  // Socket connection logic
  useEffect(() => {
    if (user) {
      const socket = socketService.connect(user._id);

      socket.on('connect', () => {
        dispatch(setSocketConnected(true));
        dispatch(setSocketId(socket.id ?? null));
      });

      socket.on('disconnect', () => {
        dispatch(setSocketConnected(false));
        dispatch(setSocketId(null));
      });

      // Handle online users
      socket.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      // Handle Real-Time Notification
      socket.on('notification', (notification) => {
        dispatch(setLikeNotifications([notification]));
      });

      // Cleanup on unmount
      return () => {
        socketService.disconnect();
      };
    }
  }, [user, dispatch]);

  return (
    <RouterProvider router={browserRouter} />
  );
}

export default App;