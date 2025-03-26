import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import MainLayout from './components/MainLayout';
import Home from './Pages/Home';
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
import { setSocketConnected, setSocketId } from './redux/socketSlice';
import socketService from './services/socketService';
import { setOnlineUsers } from './redux/chatSlice';
import { setLikeNotifications } from './redux/rtnSlice.ts';

const createProtectedRoute = (element: React.ReactNode) => (
  <AuthGuard>
    {element}
  </AuthGuard>
);

const browserRouter = createBrowserRouter([
  // Public routes
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/login',
    element: <Login />,
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

  return <RouterProvider router={browserRouter} />;
}

export default App;