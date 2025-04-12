import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { User } from "@/lib/types";
import { useDispatch, useSelector } from "react-redux";
import { setChatUser } from "@/redux/authSlice";
import { Rootstate } from "@/redux/store";
import { Send, Menu, X } from "lucide-react";
import { setMessages } from "@/redux/chatSlice";
import useGetMessages from "@/hooks/useGetMessages";
import useGetRTM from "@/hooks/useGetRTM";
import { API_BASE_URL } from "@/lib/apiConfig";
import defaultPfp from "../assets/default-pfp.webp"

const Messages = () => {
    const [followingUsers, setFollowingUsers] = useState<User[]>([]);
    const [textMessage, setTextMessage] = useState("");
    const [showSidebar, setShowSidebar] = useState(false);
    const dispatch = useDispatch();
    const { chatUser, user } = useSelector((state: Rootstate) => state.auth);
    const { onlineUsers, messages } = useSelector((state: Rootstate) => state.chat);
    const { mode } = useSelector((state: Rootstate) => state.theme);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useGetRTM();
    useGetMessages();

    useEffect(() => {
        const fetchFollowingUsers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/users/following`, { withCredentials: true });
                if (response.data.success) {
                    setFollowingUsers(response.data.following);
                }
            } catch (error) {
                console.error("Following User fetching Error:", error);
            }
        };
        fetchFollowingUsers();
    }, []);

    const handleUserClick = (user: User) => {
        dispatch(setChatUser(user));
        // Close sidebar on mobile after selecting a user
        if (window.innerWidth < 768) {
            setShowSidebar(false);
        }
    };

    useEffect(() => {
        if (!chatUser?._id) {
            dispatch(setMessages([]));
            return;
        }

        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/message/get/${chatUser._id}`, { withCredentials: true });
                if (response.data.success) {
                    dispatch(setMessages(response.data.messages));
                }
            } catch (error) {
                console.error("Message fetching error:", error);
            }
        };
        fetchMessages();
    }, [chatUser, dispatch]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (receiverId: string) => {
        if (!textMessage.trim()) return;

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/message/send/${receiverId}`,
                { textMessage },
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );

            if (response.data.success) {
                dispatch(setMessages([...messages, response.data.newMessage]));
                setTextMessage("");
            }
        } catch (error) {
            console.error("Message sending error:", error);
        }
    };

    const formatTime = (isoDate: string) => {
        const date = new Date(isoDate);
        const hour = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hour}:${minutes}`;
    };

    return (
        <div className={`flex min-h-screen w-full ${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            {/* Mobile Menu Button */}
            <button
                className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-full ${mode === 'dark' ? 'text-white bg-gray-700' : 'text-gray-800 bg-gray-100'
                    }`}
                onClick={() => setShowSidebar(!showSidebar)}
            >
                {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Sidebar for Following Users */}
            <section
                className={`${mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r fixed md:relative inset-y-0 left-0 z-10
                    w-64 md:w-[30%] transform transition-transform duration-300 ease-in-out
                    ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
                    h-screen flex flex-col`}
            >
                <h1 className={`text-center text-2xl font-bold border-b ${mode === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                    } py-4 sticky top-0 z-10`}>Messages</h1>

                {/* Scrollable user list */}
                <div className="px-4 flex-1 overflow-y-auto">
                    {followingUsers.length > 0 ? (
                        followingUsers.map((user) => {
                            const onlineUser = onlineUsers.includes(user._id);
                            return (
                                <div
                                    key={user._id}
                                    className={`px-4 py-3 rounded-lg my-2 cursor-pointer border ${mode === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                        } flex justify-between items-center 
                                        ${chatUser?._id === user._id
                                            ? mode === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
                                            : mode === 'dark'
                                                ? 'bg-gray-800 hover:bg-gray-700'
                                                : 'bg-white hover:bg-gray-100'
                                        }`}
                                    onClick={() => handleUserClick(user)}
                                >
                                    <div className="flex items-center">
                                        <img
                                            src={user.profilePicture || defaultPfp}
                                            alt="profile"
                                            className={`w-10 h-10 rounded-full object-cover mr-3 border-2 ${mode === 'dark' ? 'border-gray-500' : 'border-gray-300'
                                                }`}
                                        />
                                        <div className="flex flex-col">
                                            <p className="font-bold">{user.name}</p>
                                            <p className={mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>@{user.username}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold ${onlineUser
                                            ? 'text-green-600'
                                            : mode === 'dark' ? 'text-gray-600' : 'text-gray-400'
                                        }`}>
                                        {onlineUser ? "Online" : "Offline"}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <p className={mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No following users</p>
                    )}
                </div>
            </section>

            {/* Chat Section */}
            <section className="flex-1 flex flex-col md:ml-0 ml-0 h-screen">
                {/* Chat Header - Fixed */}
                <div className={`p-4 border-b ${mode === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                    } flex items-center sticky top-0 z-10`}>
                    {chatUser && (
                        <img
                            src={chatUser?.profilePicture || defaultPfp}
                            alt="profile"
                            className={`w-9 h-9 rounded-full object-cover mr-3 border-2 ${mode === 'dark' ? 'border-gray-500' : 'border-gray-300'
                                }`}
                        />
                    )}
                    <h1 className="text-xl font-bold pl-10">{chatUser?.name || "Select a user"}</h1>
                </div>

                {/* Chat Messages - Scrollable */}
                <div
                    className={`flex-1 overflow-y-auto p-4 space-y-3 ${mode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
                        }`}
                    style={{ height: "calc(100vh - 128px)" }} // Account for header and input heights
                >
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === user?._id ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-xs sm:max-w-sm md:max-w-md px-3 py-2 rounded-lg 
                                        ${msg.sender === user?._id
                                            ? mode === 'dark' ? 'bg-green-600 text-white' : 'bg-blue-500 text-white'
                                            : mode === 'dark'
                                                ? 'bg-gray-600 text-white'
                                                : 'bg-gray-200 text-gray-800'
                                        }`}
                                >
                                    <p className="break-words">{msg.message}</p>
                                    <span className="text-xs opacity-75 float-right mt-1">{formatTime(msg.createdAt)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={`${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            } text-center mt-4`}>
                            {chatUser ? "Start a conversation!" : "Select a user to start chatting"}
                        </p>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input - Fixed at bottom */}
                {chatUser && (
                    <div className={`p-3 pb-12 border-t ${mode === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        } flex items-center sticky bottom-0 z-10`}>
                        <input
                            type="text"
                            className={`flex-1 px-4 py-2 ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                                } rounded-lg focus:outline-none`}
                            placeholder="Type a message..."
                            value={textMessage}
                            onChange={(e) => setTextMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(chatUser._id)}
                        />
                        <button
                            className="ml-2 p-2 bg-blue-500 rounded-lg hover:bg-blue-600 text-white"
                            onClick={() => handleSendMessage(chatUser._id)}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Messages;