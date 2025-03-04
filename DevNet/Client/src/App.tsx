import './App.css'
import Login from './components/Login'
import SignUp from './components/SignUp'
import Home from './Pages/Home'
import MainLayout from './components/MainLayout'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const browserRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      }
    ]
  },
  {
    path: '/signup',
    element: <SignUp />
  },
  {
    path: 'login',
    element: <Login />
  }
])

function App() {

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App
