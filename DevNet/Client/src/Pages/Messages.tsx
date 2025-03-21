import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "@/lib/types";
import { useDispatch, useSelector } from "react-redux";
import { setChatUser } from "@/redux/authSlice";
import { Rootstate } from "@/redux/store";
import { Send } from "lucide-react";

const Messages = () => {
    const [followingUsers, setFollowingUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const dispatch = useDispatch();
    const { chatUser } = useSelector((state: Rootstate) => state.auth);

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
        setMessages([]); // Reset messages when switching users
    };

    const handleSendMessage = () => {
        if (input.trim()) {
            setMessages([...messages, input]);
            setInput("");
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-gray-900 text-white">
            {/* Sidebar */}
            <section className="w-full md:w-[30%] border-r border-gray-700 bg-gray-800">
                <h1 className="text-center text-2xl font-bold border-b border-gray-700 py-4">
                    Messages
                </h1>
                <div className="px-4">
                    {followingUsers.length > 0 ? (
                        followingUsers.map((user) => (
                            <div
                                key={user._id}
                                className={`px-4 py-3 rounded-lg my-2 cursor-pointer border border-gray-700 
                                ${chatUser?._id === user._id ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"}`}
                                onClick={() => handleUserClick(user)}
                            >
                                <p className="font-bold text-white">{user.name}</p>
                                <p className="text-gray-400">@{user.username}</p>
                            </div>
                        ))
                    ) : (
                        <p>No following Users</p>
                    )}
                </div>
            </section>

            {/* Chat Section */}
            <section className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700 bg-gray-800 flex items-center">
                    <h1 className="text-xl font-bold">{chatUser?.name || "Select a user"}</h1>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} className="flex justify-end">
                                <p className="bg-blue-500 px-4 py-2 rounded-lg text-white">
                                    {msg}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-center mt-4">
                            Start a conversation!
                        </p>
                    )}
                </div>

                {/* Message Input */}
                {chatUser && (
                    <div className="p-4 border-t border-gray-700 bg-gray-800 flex items-center">
                        <input
                            type="text"
                            className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />
                        <button
                            className="ml-2 p-2 bg-blue-500 rounded-lg hover:bg-blue-600"
                            onClick={handleSendMessage}
                        >
                            <Send className="w-5 h-5 text-white" />
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Messages;
