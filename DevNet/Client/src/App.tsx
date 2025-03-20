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

const browserRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: '/',
        element: <AuthGuard />,
        children: [
          { path: '/home', element: <Home /> },
          { path: '/:id', element: <UserProfile /> },
          { path: '/search', element: <Search /> },
          { path: '/notifications', element: <Notifications /> },
          { path: '/messages', element: <Messages /> },
          { path: '/bookmarks', element: <Bookmarks /> },
          { path: '/profile', element: <Profile /> },
        ],
      },
    ],
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

function App() {
  return <RouterProvider router={browserRouter} />;
}

export default App;
