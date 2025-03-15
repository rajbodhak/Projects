import { User } from '@/lib/types';
import axios from 'axios';
import { useState, useEffect } from 'react';

interface SuggestedUserCardProps {
  userinfo: User;
}

const SuggestedUserCard: React.FC<SuggestedUserCardProps> = ({ userinfo }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check follow status when component mounts
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!userinfo._id) return;

      try {
        const response = await axios.get(
          `http://localhost:8000/api/users/follow-status/${userinfo._id}`,
          {
            withCredentials: true
          }
        );

        if (response.data.success) {
          setIsFollowing(response.data.isFollowing);
        }
      } catch (error) {
        console.log("Follow status check error:", error);
      }
    };

    checkFollowStatus();
  }, [userinfo._id]);

  const handleFollowOrUnfollow = async () => {
    if (!userinfo._id) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8000/api/users/follow/${userinfo._id}`,
        {},
        {
          withCredentials: true
        }
      );

      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
      }
    } catch (error) {
      console.log("Follow Client Error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='p-2 rounded-2xl flex justify-between items-center border border-gray-400 mt-2'>
      <div className='flex flex-col'>
        <span className='text-lg font-bold text-gray-800'>{userinfo.name}</span>
        <span className='text-md text-gray-700'>@{userinfo.username}</span>
      </div>
      <button
        className={`btn-secondary !w-28 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleFollowOrUnfollow}
        disabled={isLoading}
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
};

export default SuggestedUserCard;