import { Home, Search, Bell, Mail, Bookmark, User } from "lucide-react"
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

const sideBarItems = [
    { icon: <Home />, itemName: 'Home', active: true },
    { icon: <Search />, itemName: 'Search', active: false },
    { icon: <Bell />, itemName: 'Notifications', active: false },
    { icon: <Mail />, itemName: 'Messages', active: false },
    { icon: <Bookmark />, itemName: 'Bookmarks', active: false },
    { icon: <User />, itemName: 'Profile', active: false },
]

const LeftSideBar = () => {
    const [activeItem, setActiveItem] = useState('Home');
    const navigate = useNavigate();
    const sidebarItemHandler = (item: any) => {
        setActiveItem(item.itemName);
        const path = '/' + (item.itemName).toLowerCase();
        navigate(path);
    }
    return (
        <div className="fixed top-0 left-0 z-10 lg:w-96 h-screen bg-white border-r border-gray-200 shadow-md">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">Logo</h1>
            </div>
            <nav className="p-4">
                {sideBarItems.map((item, index) => (
                    <div
                        key={index}
                        className={`
                            flex items-center
                            px-4 py-3 
                            rounded-lg 
                            cursor-pointer 
                            transition-colors 
                            duration-200 
                            group 
                            ${activeItem === item.itemName
                                ? 'bg-blue-50 text-blue-600'
                                : 'hover:bg-gray-100 text-gray-600'}
                        `}
                        onClick={() => sidebarItemHandler(item)}
                    >
                        <div className={`
                            mr-4 
                            ${activeItem === item.itemName
                                ? 'text-blue-600'
                                : 'text-gray-400 group-hover:text-gray-600'}
                        `}>
                            {item.icon}
                        </div>
                        <span className="font-medium hidden md:inline">{item.itemName}</span>
                    </div>
                ))}
            </nav>
        </div>
    )
}

export default LeftSideBar