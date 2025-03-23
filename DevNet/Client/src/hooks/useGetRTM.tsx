import { setMessages } from "@/redux/chatSlice";
import { Rootstate } from "@/redux/store";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import socketService from "@/services/socketService";

const useGetRTM = () => {
    const dispatch = useDispatch();
    const { socketId } = useSelector((state: Rootstate) => state.socketIo);
    const { messages } = useSelector((state: Rootstate) => state.chat);

    useEffect(() => {
        socketService.on('newMessage', (newMessage) => {
            dispatch(setMessages([...messages, newMessage]))
        });

        return () => {
            socketService.off('newMessage');
        }
    }, [messages, setMessages])
}

export default useGetRTM;