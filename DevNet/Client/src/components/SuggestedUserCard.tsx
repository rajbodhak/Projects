import { User } from '@/lib/types';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/apiConfig';
import { useNavigate } from 'react-router-dom';
import defaultPfp from "../assets/default-pfp.webp";

interface SuggestedUserCardProps {
  userinfo: User;
}

const SuggestedUserCard: React.FC<SuggestedUserCardProps> = ({ userinfo }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!userinfo._id) return;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/follow-status/${userinfo._id}`,
          { withCredentials: true }
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
        { withCredentials: true }
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
    if (userinfo._id) navigate(`/${userinfo._id}`);
  };

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group">
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={userinfo.profilePicture || defaultPfp}
          alt={userinfo.username}
          className="w-9 h-9 rounded-full object-cover cursor-pointer ring-2 ring-transparent group-hover:ring-amber-400/40 transition-all"
          onClick={handleRedirectProfile}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={handleRedirectProfile}>
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
          {userinfo.name || userinfo.username}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
          @{userinfo.username?.toLowerCase()}
        </p>
      </div>

      {/* Follow button */}
      <button
        onClick={handleFollowOrUnfollow}
        disabled={isLoading}
        className={`
          shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isFollowing
            ? 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-400 hover:text-red-500 dark:hover:text-red-400'
            : 'border-amber-400 text-amber-500 hover:bg-amber-400 hover:text-white dark:hover:text-white'
          }
        `}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};

export default SuggestedUserCard;