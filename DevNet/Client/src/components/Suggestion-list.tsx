import React from "react";

interface SuggestionsListProps {
    suggestions: Array<string | Record<string, string>>;
    highlight: string;
    dataKey?: string;
    onSuggestionClick: (suggestion: string | Record<string, string>) => void;
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({
    suggestions = [],
    highlight,
    dataKey,
    onSuggestionClick,
}) => {
    const getHighlightedText = (text: string, highlight: string) => {
        const parts = text.split(new RegExp(`(${highlight})`, "gi"));

        return (
            <span>
                {parts.map((part, index) => (
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <b key={index} className="text-gray-900 font-bold">{part}</b>
                    ) : (
                        part
                    )
                ))}
            </span>
        );
    };

    return (
        <ul className="absolute w-full border border-gray-300 border-t-0 rounded-b-md shadow-lg bg-white z-10 max-h-40 overflow-y-auto p-0 list-none suggestions-list">
            {suggestions.map((suggestion, index) => {
                const currSuggestion =
                    typeof suggestion === "object" && dataKey
                        ? suggestion[dataKey]
                        : (suggestion as string);

                return (
                    <li
                        key={index}
                        onClick={() => onSuggestionClick(suggestion)}
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        id={`suggestion-${index}`}
                        aria-selected="false"
                    >
                        {currSuggestion && getHighlightedText(currSuggestion, highlight)}
                    </li>
                );
            })}
        </ul>
    );
};

export default SuggestionsList;
