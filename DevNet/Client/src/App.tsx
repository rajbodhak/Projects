import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import MainLayout from './components/MainLayout';
import Home from './Pages/Home';
import { Bookmarks, Messages, Notifications, Profile, Search, Setting, UserProfile } from './Pages/pages.ts'
import { useDispatch, useSelector } from 'react-redux';
import { Rootstate } from './redux/store';
import { useEffect } from 'react';
import { setSocketConnected, setSocketId } from './redux/socketSlice';
import socketService from './services/socketService'
import { setOnlineUsers } from './redux/chatSlice';
import { setLikeNotifications } from './redux/rtnSlice.ts';

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
  // Protected routes
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/home" replace />,
          },
          { path: 'home', element: <Home /> }, // Note: removed leading slash
          { path: ':id', element: <UserProfile /> },
          { path: 'search', element: <Search /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'messages', element: <Messages /> },
          { path: 'bookmarks', element: <Bookmarks /> },
          { path: 'profile', element: <Profile /> },
          { path: 'settings', element: <Setting /> }
        ],
      },
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

      // Handle online users if needed in your app
      socket.on('getOnlineUsers', (onlineUsers) => {
        // Dispatch to Redux
        dispatch(setOnlineUsers(onlineUsers));
      });

      //Handle Real Time Notification
      socket.on('notification', (notification) => {
        dispatch(setLikeNotifications(notification))
      })

      // Clean up on unmount
      return () => {
        socketService.disconnect();
      };
    }
  }, [user, dispatch]);

  return <RouterProvider router={browserRouter} />;
}

export default App;
