import { Outlet } from "react-router-dom"
import LeftSideBar from "./LeftSideBar"

const MainLayout = () => {
    return (
        <div className="flex w-full min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Fixed width sidebar */}
            <div className="w-64 flex-shrink-0">
                <div className="fixed h-screen">
                    <LeftSideBar />
                </div>
            </div>

            {/* Main content that fills the remaining space */}
            <div className="flex-1 ml-2">
                <Outlet />
            </div>
        </div>
    )
}

export default MainLayout