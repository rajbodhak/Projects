import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Rootstate } from '@/redux/store';
import PostCard from '@/components/PostCard';
import { Post } from '@/lib/types';
import { Grid3x3, Settings, ExternalLink } from 'lucide-react';
import useGetProfileById from '@/hooks/useGetProfileById';
import { API_BASE_URL } from '@/lib/apiConfig';
const UserProfile = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get current logged in user
    const currentUser = useSelector((state: Rootstate) => state.auth.user);

    useGetProfileById(id!);
    // Get profile user data
    const userProfileData = useSelector((state: Rootstate) => state.auth.userProfile);
    console.log("userProfileData: ", userProfileData);

    const isOwnProfile = currentUser?._id === id;

    // Fetch user posts
    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/posts/user/${id}`, { withCredentials: true });

                if (response.data.success) {
                    setUserPosts(response.data.posts);
                }
            } catch (error) {
                console.error("Error fetching user posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [id]);


    // Check follow status when component mounts
    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!id) return;

            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/users/follow-status/${id}`,
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

        if (!isOwnProfile) {
            checkFollowStatus();
        }
    }, [id, isOwnProfile]);

    // Handle follow/unfollow user
    const handleFollowOrUnfollow = async () => {
        if (!id) return;

        setIsLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/users/follow/${id}`,
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

    // Handle post deletion
    const handlePostDelete = (postId: string) => {
        setUserPosts(prev => prev.filter(post => post._id !== postId));
    };

    // Handle post update
    const handlePostUpdate = (postId: string, updatedPost: Post) => {
        setUserPosts(prev =>
            prev.map(post => post._id === postId ? updatedPost : post)
        );
    };

    if (!userProfileData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center flex-col">
            {/* Profile Header */}
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="flex flex-col md:flex-row items-center md:items-start">
                    {/* Profile Picture */}
                    <div className="w-32 md:w-40 flex-shrink-0 mb-4 md:mb-0">
                        <img
                            src={userProfileData.profilePicture}
                            alt={`${userProfileData.username}'s profile`}
                            className="w-full h-auto aspect-square rounded-full border-2 border-amber-500 object-cover"
                        />
                    </div>

                    {/* Profile Info */}
                    <div className="flex-grow md:ml-10 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center">
                            <h1 className="text-2xl font-bold dark:text-white">{userProfileData.username}</h1>

                            {/* Action buttons */}
                            <div className="flex mt-2 md:mt-0 md:ml-4">
                                {isOwnProfile ? (
                                    <Link to="/settings" className="bg-gray-200 dark:bg-gray-700 px-4 py-1.5 rounded-md text-sm font-medium flex items-center">
                                        <Settings size={16} className="mr-1" />
                                        Edit Profile
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleFollowOrUnfollow}
                                        disabled={isLoading}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium ${isFollowing
                                            ? 'bg-gray-200 dark:bg-gray-700'
                                            : 'bg-amber-500 text-white'
                                            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isLoading ? 'Processing...' : isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start space-x-6 mt-4">
                            <div className="text-center">
                                <div className="font-bold dark:text-white">{userProfileData.posts?.length || 0}</div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">Posts</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold dark:text-white">{userProfileData.followers?.length || 0}</div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">Followers</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold dark:text-white">{userProfileData.following?.length || 0}</div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">Following</div>
                            </div>
                        </div>

                        {/* Bio & Info */}
                        <div className="mt-4">
                            <div className="font-bold dark:text-white">{userProfileData.name}</div>
                            <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{userProfileData.bio}</div>

                            {userProfileData.github && (
                                <a
                                    href={userProfileData.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 flex items-center mt-1 text-sm"
                                >
                                    <ExternalLink size={14} className="mr-1" />
                                    {userProfileData.github}
                                </a>
                            )}
                        </div>

                        {/* Skills */}
                        {userProfileData.skills && userProfileData.skills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {userProfileData.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Posts Header */}
                <div className="mt-8 border-t dark:border-gray-700">
                    <div className="flex justify-center">
                        <div className="flex items-center px-6 py-3 border-t-2 border-amber-500 text-amber-500">
                            <Grid3x3 size={16} className="mr-2" />
                            Posts
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="max-w-4xl mx-auto px-4 pb-8">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <p className="text-gray-500">Loading posts...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    onDelete={handlePostDelete}
                                    onPostUpdate={handlePostUpdate}
                                />
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No posts yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;