import { Home, Search, Bell, Mail, Bookmark, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Rootstate } from "@/redux/store";
import { markAllNotificationsAsRead } from "@/redux/rtnSlice";

const LeftSideBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useSelector((state: Rootstate) => state.auth.user);
    const { notifications } = useSelector((state: Rootstate) => state.realTimeNotification);
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

    // Count of unread notifications
    const unreadNotificationsCount = notifications.filter(notification => !notification.isRead).length;

    return (
        <>
            {/* Desktop sidebar (left side) - only visible on lg screens and above */}
            <div className="hidden lg:block fixed top-0 left-0 z-10 w-[20%] h-screen bg-white border-r border-gray-200 shadow-md">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800">Logo</h1>
                </div>
                <nav className="p-4">
                    {sideBarItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <div
                                key={index}
                                className={`
                                    flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 group
                                    ${isActive ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100 text-gray-600"}
                                `}
                                onClick={() => sidebarItemHandler(item.path)}
                            >
                                <div className={`mr-4 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} relative`}>
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
            </div>

            {/* Mobile and tablet bottom navigation - visible on md screens and below */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 shadow-md">
                <div className="flex justify-between items-center px-2 py-3">
                    {sideBarItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <div
                                key={index}
                                className={`
                                    flex flex-col items-center justify-center flex-1 cursor-pointer transition-colors duration-200
                                    ${isActive ? "text-blue-600" : "text-gray-400"}
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
                </div>
            </div>
        </>
    );
};

export default LeftSideBar;