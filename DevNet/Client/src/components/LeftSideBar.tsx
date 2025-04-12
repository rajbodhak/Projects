import { Home, Search, Bell, Mail, Bookmark, User, Sun, Moon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Rootstate } from "@/redux/store";
import { markAllNotificationsAsRead } from "@/redux/rtnSlice";
import { toggleTheme } from "@/redux/themeSlice"; // Import the theme toggle action

const LeftSideBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useSelector((state: Rootstate) => state.auth.user);
    const { notifications } = useSelector((state: Rootstate) => state.realTimeNotification);
    const { mode } = useSelector((state: Rootstate) => state.theme); // Get current theme
    const dispatch = useDispatch();

    const sideBarItems = [
        { icon: <Home size={20} />, itemName: "Home", path: "/home" },
        { icon: <Search size={20} />, itemName: "Search", path: "/search" },
        { icon: <Bell size={20} />, itemName: "Notifications", path: "/notifications" },
        { icon: <Mail size={20} />, itemName: "Messages", path: "/messages" },
        { icon: <Bookmark size={20} />, itemName: "Bookmarks", path: "/bookmarks" },
        { icon: <User size={20} />, itemName: "Profile", path: `/${user?._id}` },
    ];

    const sidebarItemHandler = (path: string) => {
        if (path === "/notifications") {
            dispatch(markAllNotificationsAsRead())
        }
        navigate(path);
    };

    // Handle theme toggle
    const handleThemeToggle = () => {
        dispatch(toggleTheme());
    };

    // Count of unread notifications
    const unreadNotificationsCount = notifications.filter(notification => !notification.isRead).length;

    return (
        <>
            {/* Desktop sidebar (left side) - only visible on lg screens and above */}
            <div className="lg:flex flex-col fixed top-0 left-0 z-20 w-[20%] h-screen bg-white border-r border-gray-200 shadow-md dark:bg-gray-900 dark:border-gray-700 dark:text-white hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Logo</h1>
                </div>

                {/* Regular navigation items */}
                <nav className="p-4">
                    {sideBarItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <div
                                key={index}
                                className={`
                        flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 group select-none
                        ${isActive
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-800 dark:text-gray-300"}
                    `}
                                onClick={() => sidebarItemHandler(item.path)}
                            >
                                <div className={`mr-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"} relative`}>
                                    {item.icon}
                                </div>
                                <span className="font-medium">{item.itemName}</span>
                                {
                                    item.itemName === 'Notifications' && unreadNotificationsCount > 0 && (
                                        <div className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                        </div>
                                    )
                                }
                            </div>
                        );
                    })}
                </nav>

                {/* Theme toggle button positioned absolutely at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    <div
                        className="flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-800 dark:text-gray-300"
                        onClick={handleThemeToggle}
                    >
                        <div className="mr-4 text-gray-400">
                            {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <span className="font-medium">{mode === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                </div>
            </div>

            {/* Mobile and tablet bottom navigation - visible on md screens and below */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-md dark:bg-gray-900 dark:border-gray-700">
                <div className="flex justify-between items-center px-2 py-3">
                    {sideBarItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <div
                                key={index}
                                className={`
                                    flex flex-col items-center justify-center flex-1 cursor-pointer transition-colors duration-200
                                    ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}
                                `}
                                onClick={() => sidebarItemHandler(item.path)}
                            >
                                <div className="relative">
                                    {item.icon}
                                    {item.itemName === 'Notifications' && unreadNotificationsCount > 0 && (
                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Theme toggle button for mobile */}
                    <div
                        className="flex flex-col items-center justify-center flex-1 cursor-pointer transition-colors duration-200 text-gray-400 dark:text-gray-500"
                        onClick={handleThemeToggle}
                    >
                        {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeftSideBar;