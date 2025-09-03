import { setMessages } from '@/redux/chatSlice';
import { Rootstate } from '@/redux/store';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { API_BASE_URL } from '@/lib/apiConfig';

const useGetMessages = () => {
    const dispatch = useDispatch();
    const { chatUser } = useSelector((state: Rootstate) => state.auth);

    useEffect(() => {
        // Don't make the API call if no chat user is selected
        if (!chatUser?._id) {
            return;
        }

        const fetchMessages = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/message/get/${chatUser._id}`,
                    { withCredentials: true }
                );

                if (response.data.success) {
                    dispatch(setMessages(response.data.messages));
                }
            } catch (error) {
                console.error("Getting Message Fetching Error", error);
            }
        };

        fetchMessages();
    }, [dispatch, chatUser]);

    return null;
};
export default useGetMessages;
