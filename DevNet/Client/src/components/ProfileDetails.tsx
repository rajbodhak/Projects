import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import axios from "axios";

interface ProfileDetailsProps {
    userinfo: User;
    onEdit: () => void;
}

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

const ProfileDetails = ({ userinfo, onEdit }: ProfileDetailsProps) => {
    const [ghStats, setGhStats] = useState<GitHubStats | null>(null);
    const [lcStats, setLcStats] = useState<LeetCodeStats | null>(null);

    useEffect(() => {
        // Fetch GitHub stats
        if (userinfo.github) {
            const username = userinfo.github.split("https://github.com/")[1];
            axios.get(`https://api.github.com/users/${username}`)
                .then(r => setGhStats(r.data))
                .catch(() => { });
        }

        // Fetch LeetCode stats via free proxy API
        if (userinfo.leetcode) {
            axios.get(`https://leetcode-stats-api.herokuapp.com/${userinfo.leetcode}`)
                .then(r => setLcStats(r.data))
                .catch(() => { });
        }
    }, [userinfo]);

    const SocialLink = ({ href, icon, label }: { href?: string; icon: React.ReactNode; label: string }) => {
        if (!href) return null;
        return (
            <a href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors text-xs">
                {icon} {label}
            </a>
        );
    };

    const ghUsername = userinfo.github?.split("https://github.com/")[1];

    return (
        <div className="max-w-lg mx-auto rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl mt-8">
            {/* Banner */}
            <div className="h-20 bg-gradient-to-r from-amber-500 to-amber-700" />

            {/* Header row */}
            <div className="bg-white dark:bg-gray-900 px-6 pb-4">
                <div className="flex items-end justify-between -mt-10 mb-4">
                    <img src={userinfo.profilePicture || "/default-pfp.webp"} alt={userinfo.username}
                        className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-900 object-cover shadow-md" />
                    <button onClick={onEdit}
                        className="mb-1 px-4 py-1.5 rounded-lg border border-amber-400 text-amber-500 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                        Edit Profile
                    </button>
                </div>

                <h2 className="text-xl font-bold">{userinfo.name}</h2>
                <p className="text-gray-500 text-sm">@{userinfo.username?.toLowerCase()}</p>
                {userinfo.bio && <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 leading-relaxed">{userinfo.bio}</p>}

                {/* Followers row */}
                <div className="flex gap-5 mt-3 text-sm">
                    <span><strong>{userinfo.followers?.length ?? 0}</strong> <span className="text-gray-400">followers</span></span>
                    <span><strong>{userinfo.following?.length ?? 0}</strong> <span className="text-gray-400">following</span></span>
                </div>

                {/* Social links */}
                {(userinfo.github || userinfo.linkedin || userinfo.twitter || userinfo.website) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        <SocialLink href={userinfo.github} label="GitHub" icon={
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
                        } />
                        <SocialLink href={userinfo.linkedin} label="LinkedIn" icon={
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                        } />
                        <SocialLink href={userinfo.twitter} label="X / Twitter" icon={
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        } />
                        <SocialLink href={userinfo.website} label="Website" icon={
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                        } />
                    </div>
                )}

                {/* Skills */}
                {userinfo.skills && userinfo.skills.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                            {userinfo.skills.map(skill => (
                                <span key={skill} className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* GitHub Stats */}
            {ghUsername && (
                <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">GitHub Activity</p>

                    {/* Stats card grid */}
                    {ghStats && (
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                                { label: "Repos", value: ghStats.public_repos },
                                { label: "GH Followers", value: ghStats.followers },
                                { label: "Following", value: ghStats.following },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-center">
                                    <div className="text-lg font-semibold">{value}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* GitHub contribution chart via github-readme-stats */}
                    <img
                        src={`https://github-readme-stats.vercel.app/api?username=${ghUsername}&show_icons=true&hide_border=true&theme=transparent&hide_title=true&count_private=true`}
                        alt="GitHub stats"
                        className="w-full rounded-xl"
                        onError={e => (e.currentTarget.style.display = 'none')}
                    />
                </div>
            )}

            {/* LeetCode Stats */}
            {userinfo.leetcode && (
                <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">LeetCode Progress</p>

                    {lcStats ? (
                        <div className="flex gap-4 items-center">
                            <div className="text-center shrink-0">
                                <div className="text-3xl font-bold text-amber-500">{lcStats.totalSolved}</div>
                                <div className="text-xs text-gray-400">solved</div>
                                {lcStats.ranking && (
                                    <div className="text-xs text-amber-500 mt-1">#{lcStats.ranking.toLocaleString()}</div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                {[
                                    { label: "Easy", solved: lcStats.easySolved, total: lcStats.totalEasy, color: "#22c55e" },
                                    { label: "Med", solved: lcStats.mediumSolved, total: lcStats.totalMedium, color: "#f59e0b" },
                                    { label: "Hard", solved: lcStats.hardSolved, total: lcStats.totalHard, color: "#ef4444" },
                                ].map(({ label, solved, total, color }) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <span className="text-xs w-8" style={{ color }}>{label}</span>
                                        <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${(solved / total) * 100}%`, background: color }} />
                                        </div>
                                        <span className="text-xs text-gray-400 w-14 text-right">{solved}/{total}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">Loading LeetCode stats for @{userinfo.leetcode}...</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileDetails;