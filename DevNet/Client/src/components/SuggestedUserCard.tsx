import { User } from '@/lib/types';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/apiConfig';
interface SuggestedUserCardProps {
  userinfo: User;
}
import { useNavigate } from 'react-router-dom';
import defaultPfp from "../assets/default-pfp.webp"

const SuggestedUserCard: React.FC<SuggestedUserCardProps> = ({ userinfo }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // Check follow status when component mounts
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!userinfo._id) return;

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/follow-status/${userinfo._id}`,
          {
            withCredentials: true
          }
        );

        if (response.data.success) {
          setIsFollowing(response.data.isFollowing);
        }
      } catch (error) {
        console.error("Follow status check error:", error);
      }
    };

    checkFollowStatus();
  }, [userinfo._id]);

  const handleFollowOrUnfollow = async () => {
    if (!userinfo._id) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/users/follow/${userinfo._id}`,
        {},
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
      }
    } catch (error) {
      console.error("Follow Client Error: ", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleRedirectProfile = () => {
    if (userinfo._id) {
      navigate(`/${userinfo._id}`);
    } else {
      console.error("User ID is undefined");
    }
  };

  return (
    <div className='p-2 rounded-2xl flex items-center justify-between border border-gray-400 mt-2'>
      <div className='flex gap-1'>
        <img
          src={userinfo.profilePicture || defaultPfp}
          alt={userinfo.username}
          className="w-8 h-8 sm:w-10 md:w-11 sm:h-10 md:h-11 rounded-full cursor-pointer"
          onClick={handleRedirectProfile}
        />
        <div className='flex flex-col'>
          <span className='text-md font-bold text-gray-800 dark:text-gray-300 cursor-pointer select-none' onClick={handleRedirectProfile}>{userinfo.name}</span>
          <span className='text-sm text-gray-700 dark:text-gray-400 cursor-pointer select-none' onClick={handleRedirectProfile}>@{userinfo.username}</span>
        </div>
      </div>
      <button
        className={`btn-secondary !w-28  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleFollowOrUnfollow}
        disabled={isLoading}
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
};

export default SuggestedUserCard;