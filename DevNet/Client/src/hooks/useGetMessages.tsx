import { setMessages } from '@/redux/chatSlice';
import { Rootstate } from '@/redux/store';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetMessages = () => {
    const dispatch = useDispatch();
    const { chatUser } = useSelector((state: Rootstate) => state.auth)
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/message/get/${chatUser?._id}`, { withCredentials: true });
                if (response.data.success) {
                    dispatch(setMessages(response.data.messages));
                    // console.log("Message Fetch Data: ", response.data);
                }
            } catch (error) {
                console.log("Getting Message Fetching Error", error)
            }
        }
        fetchMessages();
    }, [dispatch])
    return null;
}

export default useGetMessages;
