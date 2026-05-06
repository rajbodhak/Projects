import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Rootstate } from '@/redux/store';
import PostCard from '@/components/PostCard';
import { Post } from '@/lib/types';
import { Grid3x3, Settings, ExternalLink, Github, Linkedin, Twitter, Globe } from 'lucide-react';
import useGetProfileById from '@/hooks/useGetProfileById';
import { API_BASE_URL } from '@/lib/apiConfig';
import defaultPfp from "../assets/default-pfp.webp";

interface GitHubStats {
    public_repos: number;
    followers: number;
    following: number;
}

interface LeetCodeStats {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalEasy: number;
    totalMedium: number;
    totalHard: number;
    ranking: number;
}

const UserProfile = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [ghStats, setGhStats] = useState<GitHubStats | null>(null);
    const [lcStats, setLcStats] = useState<LeetCodeStats | null>(null);
    const [requestSent, setRequestSent] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);

    const currentUser = useSelector((state: Rootstate) => state.auth.user);
    useGetProfileById(id!);
    const userProfileData = useSelector((state: Rootstate) => state.auth.userProfile);
    const isOwnProfile = currentUser?._id === id;

    // Fetch GitHub + LeetCode stats
    useEffect(() => {
        if (!userProfileData) return;

        if (userProfileData.github) {
            const username = userProfileData.github.split("https://github.com/")[1];
            if (username) {
                axios.get(`https://api.github.com/users/${username}`)
                    .then(r => setGhStats(r.data))
                    .catch(() => { });
            }
        }

        if (userProfileData.leetcode) {
            axios.get(`https://leetcode-stats-api.herokuapp.com/${userProfileData.leetcode}`)
                .then(r => setLcStats(r.data))
                .catch(() => { });
        }
    }, [userProfileData]);

    // Fetch user posts
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        axios.get(`${API_BASE_URL}/api/posts/user/${id}`, { withCredentials: true })
            .then(r => { if (r.data.success) setUserPosts(r.data.posts); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    // Check follow status
    useEffect(() => {
        if (!id || isOwnProfile) return;
        axios.get(`${API_BASE_URL}/api/users/follow-status/${id}`, { withCredentials: true })
            .then(r => { if (r.data.success) setIsFollowing(r.data.isFollowing); })
            .catch(console.error);
    }, [id, isOwnProfile]);

    const handleFollowOrUnfollow = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const r = await axios.post(`${API_BASE_URL}/api/users/follow/${id}`, {}, { withCredentials: true });
            if (r.data.success) setIsFollowing(r.data.isFollowing);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleSendRequest = async () => {
        if (!id) return;
        setRequestLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/message/request/send/${id}`, {}, { withCredentials: true });
            setRequestSent(true);
        } catch (e: any) {
            alert(e.response?.data?.error || "Failed to send request");
        } finally { setRequestLoading(false); }
    };

    const handlePostDelete = (postId: string) => setUserPosts(prev => prev.filter(p => p._id !== postId));
    const handlePostUpdate = (postId: string, updatedPost: Post) =>
        setUserPosts(prev => prev.map(p => p._id === postId ? updatedPost : p));

    if (!userProfileData) {
        return <div className="flex justify-center items-center h-screen"><p>Loading profile...</p></div>;
    }

    const ghUsername = userProfileData.github?.split("https://github.com/")[1];

    return (
        <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Amber banner */}
            <div className="h-28 bg-gradient-to-r from-amber-500 to-amber-700 w-full" />

            <div className="max-w-3xl mx-auto px-4 -mt-14">
                {/* Profile card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        {/* Avatar */}
                        <img
                            src={userProfileData.profilePicture || defaultPfp}
                            alt={userProfileData.username}
                            className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-md -mt-12 sm:-mt-16"
                        />

                        {/* Name + actions */}
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-xl font-bold dark:text-white">{userProfileData.name}</h1>
                                <p className="text-gray-500 text-sm">@{userProfileData.username}</p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2 flex-wrap">
                                {isOwnProfile ? (
                                    <Link to="/settings"
                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                        <Settings size={14} /> Edit Profile
                                    </Link>
                                ) : (
                                    <>
                                        <button onClick={handleFollowOrUnfollow} disabled={isLoading}
                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                                                ${isFollowing
                                                    ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    : 'bg-amber-500 hover:bg-amber-600 text-white'}
                                                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                            {isLoading ? 'Processing...' : isFollowing ? 'Following' : 'Follow'}
                                        </button>

                                        {/* Message request button — only if not following */}
                                        {!isFollowing && (
                                            <button onClick={handleSendRequest} disabled={requestLoading || requestSent}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors
                                                    ${requestSent
                                                        ? 'border-gray-300 text-gray-400 cursor-default'
                                                        : 'border-amber-400 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}
                                                    ${requestLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                                {requestSent ? 'Request Sent' : requestLoading ? 'Sending...' : 'Message Request'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {userProfileData.bio && (
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {userProfileData.bio}
                        </p>
                    )}

                    {/* Stats row */}
                    <div className="flex gap-6 mt-4 text-sm">
                        {[
                            { label: "Posts", value: userProfileData.posts?.length ?? 0 },
                            { label: "Followers", value: userProfileData.followers?.length ?? 0 },
                            { label: "Following", value: userProfileData.following?.length ?? 0 },
                        ].map(({ label, value }) => (
                            <div key={label} className="text-center">
                                <div className="font-bold dark:text-white">{value}</div>
                                <div className="text-gray-500 text-xs">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Social links */}
                    {(userProfileData.github || userProfileData.linkedin || userProfileData.twitter || userProfileData.website) && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {userProfileData.github && (
                                <a href={userProfileData.github} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors">
                                    <Github size={13} /> GitHub
                                </a>
                            )}
                            {userProfileData.linkedin && (
                                <a href={userProfileData.linkedin} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors">
                                    <Linkedin size={13} /> LinkedIn
                                </a>
                            )}
                            {userProfileData.twitter && (
                                <a href={userProfileData.twitter} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors">
                                    <Twitter size={13} /> X / Twitter
                                </a>
                            )}
                            {userProfileData.website && (
                                <a href={userProfileData.website} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors">
                                    <Globe size={13} /> Website
                                </a>
                            )}
                        </div>
                    )}

                    {/* Skills */}
                    {userProfileData.skills && userProfileData.skills.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {userProfileData.skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1 rounded-full text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* GitHub Stats */}
                {ghUsername && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">GitHub Activity</p>

                        {ghStats && (
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {[
                                    { label: "Repos", value: ghStats.public_repos },
                                    { label: "GH Followers", value: ghStats.followers },
                                    { label: "GH Following", value: ghStats.following },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-600">
                                        <div className="text-lg font-semibold dark:text-white">{value}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <img
                            src={`https://github-readme-stats.vercel.app/api?username=${ghUsername}&show_icons=true&hide_border=true&theme=transparent&hide_title=true&count_private=true`}
                            alt="GitHub stats"
                            className="w-full rounded-xl"
                            onError={e => (e.currentTarget.style.display = 'none')}
                        />

                        <a href={userProfileData.github} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 mt-3 text-xs text-amber-500 hover:underline">
                            <ExternalLink size={12} /> View GitHub profile
                        </a>
                    </div>
                )}

                {/* LeetCode Stats */}
                {userProfileData.leetcode && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">LeetCode Progress</p>

                        {lcStats ? (
                            <div className="flex gap-6 items-center">
                                <div className="text-center shrink-0">
                                    <div className="text-4xl font-bold text-amber-500">{lcStats.totalSolved}</div>
                                    <div className="text-xs text-gray-400 mt-1">solved</div>
                                    {lcStats.ranking && (
                                        <div className="text-xs text-amber-500 mt-1 font-medium">
                                            #{lcStats.ranking.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    {[
                                        { label: "Easy", solved: lcStats.easySolved, total: lcStats.totalEasy, color: "#22c55e" },
                                        { label: "Medium", solved: lcStats.mediumSolved, total: lcStats.totalMedium, color: "#f59e0b" },
                                        { label: "Hard", solved: lcStats.hardSolved, total: lcStats.totalHard, color: "#ef4444" },
                                    ].map(({ label, solved, total, color }) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <span className="text-xs w-12 font-medium" style={{ color }}>{label}</span>
                                            <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${Math.round((solved / total) * 100)}%`, background: color }} />
                                            </div>
                                            <span className="text-xs text-gray-400 w-16 text-right">{solved}/{total}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">Loading stats for @{userProfileData.leetcode}...</p>
                        )}

                        <a href={`https://leetcode.com/${userProfileData.leetcode}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 mt-4 text-xs text-amber-500 hover:underline">
                            <ExternalLink size={12} /> View LeetCode profile
                        </a>
                    </div>
                )}

                {/* Posts */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-8">
                    <div className="flex justify-center border-b dark:border-gray-700">
                        <div className="flex items-center gap-2 px-6 py-3 border-b-2 border-amber-500 text-amber-500 text-sm font-medium">
                            <Grid3x3 size={15} /> Posts
                        </div>
                    </div>
                    <div className="p-4 space-y-4">
                        {loading ? (
                            <p className="text-center text-gray-400 py-8 text-sm">Loading posts...</p>
                        ) : userPosts.length > 0 ? (
                            userPosts.map(post => (
                                <PostCard key={post._id} post={post} onDelete={handlePostDelete} onPostUpdate={handlePostUpdate} />
                            ))
                        ) : (
                            <p className="text-center text-gray-400 py-8 text-sm">No posts yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;