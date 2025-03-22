import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Home from './Pages/Home';
import MainLayout from './components/MainLayout';
import Notifications from './Pages/Notifications';
import Messages from './Pages/Messages';
import Search from './Pages/Search';
import Bookmarks from './Pages/Bookmarks';
import Profile from './Pages/Profile';
import UserProfile from './Pages/UserProfile';
import Setting from './Pages/Setting';
import { io } from "socket.io-client";
import { useSelector } from 'react-redux';
import { Rootstate } from './redux/store';
import { useEffect } from 'react';

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
  useEffect(() => {
    if (user) {
      const socketio = io('http://localhost:8000', {
        query: {
          userId: user._id
        },
        transports: ['websocket']
      });

    }
  }, [])
  return <RouterProvider router={browserRouter} />;
}

export default App;
