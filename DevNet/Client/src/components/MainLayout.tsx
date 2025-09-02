import { Outlet } from "react-router-dom"
import LeftSideBar from "./LeftSideBar"

const MainLayout = () => {
    return (
        <div className="flex w-full h-screen dark:bg-gray-900 overflow-hidden">
            {/* Left sidebar and main content in shared scroll container */}
            <div className="flex flex-1 overflow-y-auto scrollbar-hide">
                {/* Left sidebar - fixed width */}
                <div className="hidden lg:block w-[20%] flex-shrink-0">
                    <LeftSideBar />
                </div>

                {/* Main content */}
                <div className="flex-1 pb-16 lg:pb-0">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default MainLayout