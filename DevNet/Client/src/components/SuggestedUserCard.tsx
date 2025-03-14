import { User } from '@/lib/types';
import axios from 'axios';
import { useState } from 'react';

const SuggestedUserCard = (userinfo: User) => {

  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowOrUnfollow = async () => {
    if (!userinfo._id) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`http://localhost:8000/api/users/follow/${userinfo._id}`);
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
    <div className='p-2 rounded-2xl flex justify-between items-center'>
      <div className='flex flex-col'>
        <span className='text-xl font-bold text-gray-800'>{userinfo.name}</span>
        <span className='text-lg text-gray-700'>{userinfo.username}</span>
      </div>
      <button
        className={`btn-secondary mx-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleFollowOrUnfollow}
        disabled={isLoading}
      >
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
};

export default SuggestedUserCard;