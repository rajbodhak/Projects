import { useSelector } from 'react-redux';
import useGetProfileById from '@/hooks/useGetProfileById';
import { Rootstate } from '@/redux/store';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
    const { id } = useParams();

    useGetProfileById(id!);

    const userProfileData = useSelector((state: Rootstate) => state.auth.userProfile);
    console.log("User Profile Data: ", userProfileData);

    return (
        <div className='w-full bg-red-200'>
            {userProfileData ? (
                <div>
                    <h1>{userProfileData?.name}</h1>
                    <p>{userProfileData?.username}</p>
                </div>
            ) : (
                <p> Loading... </p>
            )}
        </div>
    );
};

export default UserProfile;
