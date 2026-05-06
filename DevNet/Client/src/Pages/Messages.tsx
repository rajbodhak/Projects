import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { User } from "@/lib/types";
import { useDispatch, useSelector } from "react-redux";
import { setChatUser } from "@/redux/authSlice";
import { Rootstate } from "@/redux/store";
import { Send, Menu, X, Inbox, MessageSquare, Check, XCircle } from "lucide-react";
import { setMessages } from "@/redux/chatSlice";
import useGetMessages from "@/hooks/useGetMessages";
import useGetRTM from "@/hooks/useGetRTM";
import { API_BASE_URL } from "@/lib/apiConfig";
import defaultPfp from "../assets/default-pfp.webp";
import socketService from "@/services/socketService";

interface MessageRequest {
    _id: string;
    sender: User;
    status: "pending" | "accepted" | "declined";
    createdAt: string;
}

const Messages = () => {
    const [followingUsers, setFollowingUsers] = useState<User[]>([]);
    const [requests, setRequests] = useState<MessageRequest[]>([]);
    const [tab, setTab] = useState<"chats" | "requests">("chats");
    const [textMessage, setTextMessage] = useState("");
    const [showSidebar, setShowSidebar] = useState(false);

    const dispatch = useDispatch();
    const { chatUser, user } = useSelector((state: Rootstate) => state.auth);
    const { onlineUsers, messages } = useSelector((state: Rootstate) => state.chat);
    const { mode } = useSelector((state: Rootstate) => state.theme);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useGetRTM();
    useGetMessages();

    // Fetch following users
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/users/following`, { withCredentials: true })
            .then(r => { if (r.data.success) setFollowingUsers(r.data.following); })
            .catch(console.error);
    }, []);

    // Fetch pending requests
    const fetchRequests = async () => {
        try {
            const r = await axios.get(`${API_BASE_URL}/api/message/request/all`, { withCredentials: true });
            if (r.data.success) setRequests(r.data.requests);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchRequests(); }, []);

    // Listen for incoming message requests via socket
    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket) return;

        socket.on("messageRequest", (request: MessageRequest) => {
            setRequests(prev => [request, ...prev]);
        });

        socket.on("messageRequestAccepted", () => {
            axios.get(`${API_BASE_URL}/api/users/following`, { withCredentials: true })
                .then(r => { if (r.data.success) setFollowingUsers(r.data.following); });
        });

        return () => {
            socket.off("messageRequest");
            socket.off("messageRequestAccepted");
        };
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch messages when chat user changes
    useEffect(() => {
        if (!chatUser?._id) { dispatch(setMessages([])); return; }
        axios.get(`${API_BASE_URL}/api/message/get/${chatUser._id}`, { withCredentials: true })
            .then(r => { if (r.data.success) dispatch(setMessages(r.data.messages)); })
            .catch(console.error);
    }, [chatUser, dispatch]);

    const handleUserClick = (u: User) => {
        dispatch(setChatUser(u));
        if (window.innerWidth < 768) setShowSidebar(false);
    };

    const handleAccept = async (requestId: string) => {
        try {
            await axios.put(`${API_BASE_URL}/api/message/request/accept/${requestId}`, {}, { withCredentials: true });
            setRequests(prev => prev.filter(r => r._id !== requestId));
            fetchRequests();
        } catch (e) { console.error(e); }
    };

    const handleDecline = async (requestId: string) => {
        try {
            await axios.put(`${API_BASE_URL}/api/message/request/decline/${requestId}`, {}, { withCredentials: true });
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (e) { console.error(e); }
    };

    const handleSendMessage = async (receiverId: string) => {
        if (!textMessage.trim()) return;
        try {
            const r = await axios.post(
                `${API_BASE_URL}/api/message/send/${receiverId}`,
                { textMessage },
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );
            if (r.data.success) {
                dispatch(setMessages([...messages, r.data.newMessage]));
                setTextMessage("");
            }
        } catch (e) { console.error(e); }
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    };

    const dark = mode === "dark";
    const bg = dark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800";
    const sidebarBg = dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const headerBg = dark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white";

    return (
        <div className={`flex min-h-screen w-full ${bg}`}>
            {/* Mobile toggle */}
            <button className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-full ${dark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"}`}
                onClick={() => setShowSidebar(!showSidebar)}>
                {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Sidebar */}
            <section className={`${sidebarBg} border-r fixed md:relative inset-y-0 left-0 z-10 w-64 md:w-[30%]
                transform transition-transform duration-300 ${showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"} h-screen flex flex-col`}>

                <h1 className={`text-center text-xl font-bold border-b ${headerBg} py-4 sticky top-0 z-10`}>Messages</h1>

                {/* Tabs */}
                <div className={`flex border-b ${dark ? "border-gray-700" : "border-gray-200"}`}>
                    <button
                        onClick={() => setTab("chats")}
                        className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors
                            ${tab === "chats"
                                ? "border-b-2 border-amber-500 text-amber-500"
                                : dark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}>
                        <MessageSquare className="w-4 h-4" /> Chats
                    </button>
                    <button
                        onClick={() => setTab("requests")}
                        className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors
                            ${tab === "requests"
                                ? "border-b-2 border-amber-500 text-amber-500"
                                : dark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}>
                        <Inbox className="w-4 h-4" />
                        Requests
                        {requests.length > 0 && (
                            <span className="ml-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {requests.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2">
                    {/* Chats tab */}
                    {tab === "chats" && (
                        followingUsers.length > 0 ? followingUsers.map(u => {
                            const isOnline = onlineUsers.includes(u._id);
                            return (
                                <div key={u._id}
                                    onClick={() => handleUserClick(u)}
                                    className={`px-3 py-3 rounded-lg my-1.5 cursor-pointer border flex justify-between items-center
                                        ${dark ? "border-gray-700" : "border-gray-200"}
                                        ${chatUser?._id === u._id
                                            ? dark ? "bg-gray-700" : "bg-amber-50 border-amber-200"
                                            : dark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={u.profilePicture || defaultPfp} alt="pfp"
                                                className="w-10 h-10 rounded-full object-cover" />
                                            {isOnline && (
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{u.name}</p>
                                            <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>@{u.username}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-8">
                                <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>No chats yet</p>
                                <p className={`text-xs mt-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                                    Follow users to start chatting, or send a message request
                                </p>
                            </div>
                        )
                    )}

                    {/* Requests tab */}
                    {tab === "requests" && (
                        requests.length > 0 ? requests.map(req => (
                            <div key={req._id}
                                className={`p-3 rounded-lg my-1.5 border ${dark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                                <div className="flex items-center gap-3 mb-2.5">
                                    <img src={req.sender.profilePicture || defaultPfp} alt="pfp"
                                        className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="font-medium text-sm">{req.sender.name}</p>
                                        <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
                                            @{req.sender.username}
                                        </p>
                                    </div>
                                </div>
                                <p className={`text-xs mb-2.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>
                                    Wants to send you a message
                                </p>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAccept(req._id)}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors">
                                        <Check className="w-3.5 h-3.5" /> Accept
                                    </button>
                                    <button onClick={() => handleDecline(req._id)}
                                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs font-medium transition-colors
                                            ${dark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                                        <XCircle className="w-3.5 h-3.5" /> Decline
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8">
                                <Inbox className={`w-8 h-8 mx-auto mb-2 ${dark ? "text-gray-600" : "text-gray-300"}`} />
                                <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>No pending requests</p>
                            </div>
                        )
                    )}
                </div>
            </section>

            {/* Chat area */}
            <section className="flex-1 flex flex-col h-screen">
                <div className={`p-4 border-b ${headerBg} flex items-center sticky top-0 z-10`}>
                    {chatUser && (
                        <img src={chatUser.profilePicture || defaultPfp} alt="pfp"
                            className="w-9 h-9 rounded-full object-cover mr-3" />
                    )}
                    <h1 className="text-xl font-bold pl-10">{chatUser?.name || "Select a user"}</h1>
                </div>

                <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${dark ? "bg-gray-900" : "bg-gray-50"}`}
                    style={{ height: "calc(100vh - 128px)" }}>
                    {messages.length > 0 ? messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === user?._id ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs sm:max-w-sm md:max-w-md px-3 py-2 rounded-lg
                                ${msg.sender === user?._id
                                    ? "bg-amber-500 text-white"
                                    : dark ? "bg-gray-700 text-white" : "bg-white text-gray-800 border border-gray-200"}`}>
                                <p className="break-words text-sm">{msg.message}</p>
                                <span className="text-xs opacity-60 float-right mt-1">{formatTime(msg.createdAt)}</span>
                            </div>
                        </div>
                    )) : (
                        <p className={`text-center mt-4 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>
                            {chatUser ? "Start a conversation!" : "Select a user to start chatting"}
                        </p>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {chatUser && (
                    <div className={`p-3 pb-12 border-t ${headerBg} flex items-center sticky bottom-0 z-10`}>
                        <input type="text"
                            className={`flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400
                                ${dark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"}`}
                            placeholder="Type a message..."
                            value={textMessage}
                            onChange={e => setTextMessage(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSendMessage(chatUser._id)} />
                        <button onClick={() => handleSendMessage(chatUser._id)}
                            className="ml-2 p-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-white transition-colors">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Messages;