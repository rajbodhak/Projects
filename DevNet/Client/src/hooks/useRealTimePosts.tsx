import { addNewPost } from "@/redux/postSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import socketService from "@/services/socketService";

const useRealTimePosts = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        //listen for the new posts
        socketService.on('newPost', (newPost) => {
            dispatch(addNewPost(newPost))
        });

        return () => {
            socketService.off('newPost');
        };
    }, [dispatch])
};

export default useRealTimePosts