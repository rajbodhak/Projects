import { Outlet } from "react-router-dom"
import LeftSideBar from "./LeftSideBar"

const MainLayout = () => {
    return (
        <div className="flex w-full min-h-screen dark:bg-gray-900">
            {/* Sidebar space - only visible on lg screens */}
            <div className="hidden lg:block w-[20%] flex-shrink-0">
                {/* This is just a spacer div */}
            </div>

            {/* Main content that fills the remaining space */}
            <div className="flex-1 pb-16 lg:pb-0">
                <Outlet />
            </div>

            {/* The actual sidebar component is rendered outside the flex container */}
            <LeftSideBar />
        </div>
    )
}

export default MainLayout