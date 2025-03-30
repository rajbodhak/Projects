import React from "react";

interface User {
    _id: string;
    username: string;
    name?: string;
    profilePicture?: string;
    bio?: string;
    skills?: string[];
}

interface SuggestionsListProps {
    suggestions: User[];
    highlight: string;
    dataKey: string;
    onSuggestionClick: (suggestion: User) => void;
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({
    suggestions = [],
    highlight,
    dataKey,
    onSuggestionClick,
}) => {
    const getHighlightedText = (text: string, highlight: string) => {
        if (!text) return <span></span>;

        const parts = text.split(new RegExp(`(${highlight})`, "gi"));

        return (
            <span>
                {parts.map((part, index) => (
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <b key={index} className="text-blue-600 font-bold bg-blue-100  rounded">{part}</b>
                    ) : (
                        part
                    )
                ))}
            </span>
        );
    };

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="absolute w-full mt-2 z-50">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-75 blur-sm"></div>
                <div className="relative rounded-lg overflow-hidden">
                    <ul className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl max-h-64 overflow-y-auto">
                        {suggestions.map((user, index) => {
                            const displayName = user.name || user.username;
                            const displayValue = user[dataKey as keyof User] as string;

                            return (
                                <li
                                    key={user._id || index}
                                    onClick={() => onSuggestionClick(user)}
                                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-none"
                                >
                                    <div className="p-3 flex items-center gap-3">
                                        {user.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={displayName}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {displayName.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div className="flex flex-col">
                                            <div className="font-medium text-gray-800 dark:text-white">
                                                {getHighlightedText(displayValue, highlight)}
                                            </div>
                                            {user.bio && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                    {user.bio.length > 60 ? user.bio.substring(0, 60) + '...' : user.bio}
                                                </div>
                                            )}
                                            {user.skills && user.skills.length > 0 && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {user.skills.slice(0, 3).map((skill, idx) => (
                                                        <span key={idx} className="px-1.5 py-0.5 bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {user.skills.length > 3 && (
                                                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                                            +{user.skills.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}

                        {suggestions.length === 0 && (
                            <li className="p-4 text-gray-500 dark:text-gray-400 text-center">
                                No results found
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SuggestionsList;