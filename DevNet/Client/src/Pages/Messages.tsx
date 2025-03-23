import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "@/lib/types";
import { useDispatch, useSelector } from "react-redux";
import { setChatUser } from "@/redux/authSlice";
import { Rootstate } from "@/redux/store";
import { Send } from "lucide-react";
import { setMessages } from "@/redux/chatSlice";
import useGetMessages from "@/hooks/useGetMessages";

const Messages = () => {
    const [followingUsers, setFollowingUsers] = useState<User[]>([]);
    const [textMessage, setTextMessage] = useState("");
    const dispatch = useDispatch();
    const { chatUser } = useSelector((state: Rootstate) => state.auth);
    const { onlineUsers, messages } = useSelector((state: Rootstate) => state.chat);
    useGetMessages();

    useEffect(() => {
        const fetchFollowingUsers = async () => {
            try {
                const response = await axios.get("/api/users/following", {
                    withCredentials: true,
                });
                if (response.data.success) {
                    setFollowingUsers(response.data.following);
                }
            } catch (error) {
                console.log("Following User fetching Errors", error);
            }
        };
        fetchFollowingUsers();
    }, []);

    const handleUserClick = (user: User) => {
        dispatch(setChatUser(user));
        // setMessage("");
    };

    useEffect(() => {
        if (!chatUser?._id) {
            // Clear messages if no chat user is selected
            dispatch(setMessages([]));
            return;
        }

        const fetchMessages = async () => {
            try {
                console.log("Fetching messages for user:", chatUser._id);
                const response = await axios.get(
                    `http://localhost:8000/api/message/get/${chatUser._id}`,
                    { withCredentials: true }
                );

                if (response.data.success) {
                    dispatch(setMessages(response.data.messages));
                }
            } catch (error) {
                console.log("Message fetching error", error);
            }
        };

        fetchMessages();
    }, [chatUser, dispatch]);

    // Existing effect for cleanup
    useEffect(() => {
        return () => {
            dispatch(setChatUser(null))
        }
    }, [])

    const handleSendMessage = async (receiverId: string) => {
        // console.log("Sending message to:", receiverId);
        try {
            const response = await axios.post(`http://localhost:8000/api/message/send/${receiverId}`, { textMessage }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (response.data.success && textMessage.trim()) {
                dispatch(setMessages([...messages, response.data.newMessage]));
                setTextMessage("");
            }
        } catch (error) {
            console.log("Message sending error in MessagePage: ", error)
        }
    };

    useEffect(() => {
        return () => {
            dispatch(setChatUser(null))
        }
    }, [])

    return (
        <div className="flex min-h-screen w-full bg-gray-900 text-white">
            {/* Sidebar */}
            <section className="w-full md:w-[30%] border-r border-gray-700 bg-gray-800">
                <h1 className="text-center text-2xl font-bold border-b border-gray-700 py-4">
                    Messages
                </h1>
                <div className="px-4">
                    {followingUsers.length > 0 ? (
                        followingUsers.map((user) => {
                            const onlineUser = onlineUsers.includes(user._id);
                            return (
                                <div
                                    key={user._id}
                                    className={`px-4 py-3 rounded-lg my-2 cursor-pointer border border-gray-700 flex justify-between items-center
                                ${chatUser?._id === user._id ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"}`}
                                    onClick={() => handleUserClick(user)}
                                >
                                    <div className="flex items-center">
                                        <img src={user.profilePicture} alt="pfp" className="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer object-cover mr-3 border-2 border-gray-500" />
                                        <div className="flex flex-col">
                                            <p className="font-bold text-white">{user.name}</p>
                                            <p className="text-gray-400">@{user.username}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs lg:text-sm font-bold ${onlineUser ? 'text-green-600' : 'text-red-600'}`}>
                                        {onlineUser ? 'online' : 'offline'}
                                    </span>
                                </div>
                            )

                        })
                    ) : (
                        <p>No following Users</p>
                    )}
                </div>
            </section >

            {/* Chat Section */}
            < section className="flex-1 flex flex-col" >
                {/* Chat Header */}
                < div className="p-4 border-b border-gray-700 bg-gray-800 flex items-center" >
                    {
                        chatUser && <img src={chatUser?.profilePicture} alt=' '
                            className="w-9 h-9 rounded-full flex-shrink-0 cursor-pointer object-cover mr-3 border-2 border-gray-500"
                        />
                    }
                    <h1 className="text-xl font-bold">{chatUser?.name || "Select a user"}</h1>
                </div >

                {/* Chat Messages */}
                < div className="flex-1 overflow-y-auto p-4 space-y-3" >
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} className="flex justify-end">
                                <p className="bg-blue-500 px-4 py-2 rounded-lg text-white">
                                    {typeof msg === 'string' ? msg : msg.message}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-center mt-4">
                            Start a conversation!
                        </p>
                    )}
                </div >

                {/* Message Input */}
                {
                    chatUser && (
                        <div className="p-4 border-t border-gray-700 bg-gray-800 flex items-center">
                            <input
                                type="text"
                                className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none"
                                placeholder="Type a message..."
                                value={textMessage}
                                onChange={(e) => setTextMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(chatUser._id)}
                            />
                            <button
                                className="ml-2 p-2 bg-blue-500 rounded-lg hover:bg-blue-600"
                                onClick={() => handleSendMessage(chatUser._id)}
                            >
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    )
                }
            </section >
        </div >
    );
};

export default Messages;
