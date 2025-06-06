import { setUserProfile } from '@/redux/authSlice';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { API_BASE_URL } from '@/lib/apiConfig';

const useGetProfileById = (userId: string) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/profile`, { withCredentials: true });
                if (response.data.success) {
                    dispatch(setUserProfile(response.data.user));
                    console.log("The User Profile Data: ", response.data);
                }
            } catch (error) {
                console.log("Getting user profile Error", error)
            }
        }
        fetchUserProfile();
    }, [userId, dispatch])
    return null;
}

export default useGetProfileById;
