import React, { useState, useCallback, useEffect } from 'react'
import SuggestionsList from './Suggestion-list';
import debounce from "lodash/debounce"

interface AutoCompleteInputProps {
    fetchSuggestions: (value: string) => Promise<any[]>;
    placeholder: string;
    customLoading: string;
    onSelect: (value: any) => void;
    onBlur: () => void;
    onChange: (value: string) => void;
    customStyles?: string;
    datakey: string;
}

const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
    placeholder,
    onBlur,
    onSelect,
    onChange,
    customStyles,
    fetchSuggestions,
    datakey,
    customLoading
}) => {
    const [inputValue, setInputValue] = useState("");
    const [suggestionsData, setSuggestionData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value);
        onChange(value);
        setShowSuggestions(true);
    };

    const getSuggestions = async (query: string) => {
        if (!query || query.trim().length < 2) {
            setSuggestionData([]);
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const result = await fetchSuggestions(query);
            setSuggestionData(result);
        } catch (error) {
            setError("Failed to Fetch Suggestions");
            setSuggestionData([]);
        } finally {
            setLoading(false);
        }
    };

    const getSuggestionsDebounced = useCallback(
        debounce(getSuggestions, 300),
        [fetchSuggestions]
    );

    useEffect(() => {
        if (inputValue.length > 1) {
            getSuggestionsDebounced(inputValue);
        } else {
            setSuggestionData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue]);

    const handleSuggestionClick = (suggestion: any) => {
        if (suggestion && typeof suggestion === "object" && datakey) {
            setInputValue(suggestion[datakey] || "");
        } else if (typeof suggestion === "string") {
            setInputValue(suggestion);
        }

        onSelect(suggestion);
        setShowSuggestions(false);
    };

    const handleBlur = () => {
        // Use setTimeout to allow click events on suggestions to fire before hiding
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
        onBlur();
    };

    return (
        <div className='w-full relative'>
            <input
                type="text"
                value={inputValue}
                placeholder={placeholder}
                onBlur={handleBlur}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                className={`w-full py-3 px-4 text-base outline-none transition-all duration-200 bg-white placeholder-gray-400 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 ${customStyles}`}
            />

            {showSuggestions && suggestionsData.length > 0 && (
                <SuggestionsList
                    suggestions={suggestionsData}
                    highlight={inputValue}
                    dataKey={datakey}
                    onSuggestionClick={handleSuggestionClick}
                />
            )}

            {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {customLoading}
                </div>
            )}

            {error && (
                <div className="mt-1 text-red-500 text-sm">
                    {error}
                </div>
            )}
        </div>
    )
}

export default AutoCompleteInput