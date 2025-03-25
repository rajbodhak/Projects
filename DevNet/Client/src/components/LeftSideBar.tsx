import { Home, Search, Bell, Mail, Bookmark, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Rootstate } from "@/redux/store";

const LeftSideBar = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const user = useSelector((state: Rootstate) => state.auth.user);
    const { likeNotifications } = useSelector((state: Rootstate) => state.realTimeNotification);

    const sideBarItems = [
        { icon: <Home />, itemName: "Home", path: "/home" },
        { icon: <Search />, itemName: "Search", path: "/search" },
        { icon: <Bell />, itemName: "Notifications", path: "/notifications" },
        { icon: <Mail />, itemName: "Messages", path: "/messages" },
        { icon: <Bookmark />, itemName: "Bookmarks", path: "/bookmarks" },
        { icon: <User />, itemName: "Profile", path: `/${user?._id}` },
    ];

    const sidebarItemHandler = (path: string) => {
        navigate(path);
    };

    return (
        <div className="fixed top-0 left-0 z-10 w-[20%] h-screen bg-white border-r border-gray-200 shadow-md">
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
                            <div className={`mr-4 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                                {item.icon}
                            </div>
                            <span className="font-medium hidden md:inline">{item.itemName}</span>
                            {
                                item.itemName === 'Notifications' && likeNotifications.length > 0 && (
                                    <div className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {likeNotifications.length}
                                    </div>
                                )
                            }
                        </div>
                    );
                })}
            </nav>
        </div>
    );
};

export default LeftSideBar;